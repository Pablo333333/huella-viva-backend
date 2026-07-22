"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
require("dotenv/config");
const dbUrl = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString: dbUrl });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Seed: Iniciando poblamiento de base de datos Huella Viva 360...');
    await prisma.commitment.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.investment.deleteMany();
    await prisma.project.deleteMany();
    await prisma.community.deleteMany();
    await prisma.user.deleteMany();
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@huellaviva.com',
            password: hashedPassword,
            name: 'Administrador Territorial',
            role: 'ADMIN',
        },
    });
    const supervisor = await prisma.user.create({
        data: {
            email: 'supervisor@huellaviva.com',
            password: hashedPassword,
            name: 'Supervisor de Campo',
            role: 'SUPERVISOR',
        },
    });
    console.log('Usuarios creados correctamente.');
    const elRoble = await prisma.community.create({
        data: {
            nombre: 'Comunidad El Roble',
            poblacion: 450,
            location: 4.6097,
        },
    });
    const sanJose = await prisma.community.create({
        data: {
            nombre: 'San José del Guaviare',
            poblacion: 1200,
            location: 2.5678,
        },
    });
    console.log('Comunidades creadas correctamente.');
    const pozoAgua = await prisma.project.create({
        data: {
            nombre: 'Construcción Pozo de Agua',
            tipo: 'AGUA',
            presupuesto: 45000,
            financiador: 'Huella Viva Fund',
            estado: 'EN_EJECUCION',
            communityId: elRoble.id,
        },
    });
    const escuela = await prisma.project.create({
        data: {
            nombre: 'Refacción Escuela Primaria',
            tipo: 'EDUCACION',
            presupuesto: 15000,
            financiador: 'Gobierno Local',
            estado: 'CULMINADO',
            communityId: sanJose.id,
        },
    });
    console.log('Proyectos creados correctamente.');
    const reunion1 = await prisma.activity.create({
        data: {
            tipo: 'REUNION',
            descripcion: 'Reunión inicial para coordinar la entrega de materiales del pozo.',
            userId: supervisor.id,
            communityId: elRoble.id,
            location: 4.6097,
        },
    });
    console.log('Actividades creadas correctamente.');
    await prisma.commitment.create({
        data: {
            descripcion: 'Entrega de 50 metros de tubería PVC',
            responsable: 'Supervisor de Campo',
            estado: 'PROGRAMADO',
            activityId: reunion1.id,
            fecha_cumplimiento: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    console.log('Compromisos creados correctamente.');
    console.log('Seed finalizado con éxito.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map