"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    const states = [
        { name: 'NUEVO', description: 'Ticket recién creado' },
        { name: 'EN_PROCESO', description: 'Ticket siendo atendido' },
        { name: 'COMPLETADO', description: 'Ticket resuelto con éxito' },
        { name: 'CANCELADO', description: 'Ticket anulado' },
        { name: 'CERRADO', description: 'Ticket finalizado y archivado' },
    ];
    for (const state of states) {
        await prisma.workflowState.upsert({
            where: { name: state.name },
            update: {},
            create: state,
        });
    }
    const categories = [
        { name: 'SOPORTE', description: 'Consultas técnicas y ayuda' },
        { name: 'OBRA', description: 'Gestión de proyectos en campo' },
        { name: 'DOCUMENTACIÓN', description: 'Trámites y archivos legales' },
    ];
    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        });
    }
    console.log('Seed completed successfully.');
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