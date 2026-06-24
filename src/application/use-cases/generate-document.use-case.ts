import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import * as handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class GenerateDocumentUseCase {
  constructor(
    @Inject(ITicketRepository)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(ticketId: string): Promise<Buffer> {
    const ticket = await this.ticketRepository.findById(ticketId);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Cargar y compilar la plantilla
    const templatePath = join(__dirname, '..', '..', 'infrastructure', 'documents', 'templates', 'ticket-report.hbs');
    const templateSource = readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);

    // Preparar datos para la plantilla
    const data = {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      categoryName: ticket.categoryName,
      statusName: ticket.statusName,
      latitude: ticket.latitude,
      longitude: ticket.longitude,
      hasLocation: !!(ticket.latitude && ticket.longitude),
      currentDate: new Date().toLocaleString(),
      userName: 'Sistema KONTROLIA', // Podríamos pasar el nombre del usuario autenticado
    };

    const html = template(data);

    // Generar PDF con Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  }
}
