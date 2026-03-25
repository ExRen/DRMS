import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
    sub: string;
    username: string;
    role: string;
    unitKerjaId: string;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async login(username: string, password: string) {
        // 1. Verifikasi ke LDAP/Active Directory
        const ldapUser = await this.verifyLdap(username, password);
        if (!ldapUser) throw new UnauthorizedException('Username atau password salah');

        // 2. Cari atau buat user lokal
        const user = await this.prisma.user.upsert({
            where: { adUsername: username },
            update: {
                nama: ldapUser.displayName ?? username,
                email: ldapUser.mail ?? `${username}@asabri.co.id`,
                jabatan: ldapUser.title,
                lastLoginAt: new Date(),
            },
            create: {
                adUsername: username,
                nama: ldapUser.displayName ?? username,
                email: ldapUser.mail ?? `${username}@asabri.co.id`,
                jabatan: ldapUser.title,
                nip: ldapUser.employeeID,
                unitKerjaId: await this.getDefaultUnitKerjaId(),
            },
            include: { unitKerja: true },
        });

        if (!user.isActive) {
            throw new UnauthorizedException('Akun Anda telah dinonaktifkan');
        }

        // 3. Generate JWT
        const payload: JwtPayload = {
            sub: user.id,
            username: user.adUsername,
            role: user.role,
            unitKerjaId: user.unitKerjaId,
        };

        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user.id,
                nama: user.nama,
                email: user.email,
                role: user.role,
                unitKerja: user.unitKerja,
            },
        };
    }

    async getProfile(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: { unitKerja: true },
        });
    }

    private async verifyLdap(username: string, password: string): Promise<Record<string, any> | null> {
        // In development mode, allow login with any credentials
        if (process.env.NODE_ENV === 'development') {
            this.logger.warn('⚠️ Development mode: LDAP verification skipped');
            return {
                displayName: username,
                mail: `${username}@asabri.co.id`,
                title: 'Staff',
                employeeID: username,
            };
        }

        try {
            const ldap = await import('ldapjs');
            return new Promise((resolve) => {
                const client = ldap.createClient({ url: process.env.LDAP_URL! });

                client.bind(process.env.LDAP_BIND_DN!, process.env.LDAP_BIND_CREDENTIALS!, (bindErr: any) => {
                    if (bindErr) {
                        this.logger.error('LDAP bind error:', bindErr);
                        client.destroy();
                        return resolve(null);
                    }

                    const opts: any = {
                        filter: `(${process.env.LDAP_USERNAME_ATTRIBUTE}=${username})`,
                        scope: 'sub',
                        attributes: ['displayName', 'mail', 'title', 'employeeID', 'dn'],
                    };

                    client.search(process.env.LDAP_SEARCH_BASE!, opts, (searchErr: any, res: any) => {
                        if (searchErr) { client.destroy(); return resolve(null); }

                        let userEntry: any = null;

                        res.on('searchEntry', (entry: any) => { userEntry = entry; });

                        res.on('end', () => {
                            if (!userEntry) { client.destroy(); return resolve(null); }

                            client.bind(userEntry.dn, password, (authErr: any) => {
                                client.destroy();
                                if (authErr) return resolve(null);
                                resolve(userEntry.pojo.attributes.reduce(
                                    (acc: any, attr: any) => ({ ...acc, [attr.type]: attr.values[0] }), {}
                                ));
                            });
                        });
                    });
                });
            });
        } catch {
            this.logger.error('LDAP module not available');
            return null;
        }
    }

    private async getDefaultUnitKerjaId(): Promise<string> {
        const setum = await this.prisma.unitKerja.findFirst({
            where: { kode: 'BID-SETUM' },
        });
        if (!setum) throw new Error('Unit kerja default tidak ditemukan. Jalankan seed terlebih dahulu.');
        return setum.id;
    }
}
