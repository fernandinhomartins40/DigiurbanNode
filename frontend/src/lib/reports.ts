import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ReportData {
  title: string;
  subtitle?: string;
  headers: string[];
  data: unknown[][];
  summary?: { label: string; value: string | number }[];
  metadata?: { 
    generatedBy: string;
    department: string;
    period: string;
  };
}

export class ReportGenerator {
  /**
   * Gera relatório em PDF
   */
  static generatePDF(reportData: ReportData): void {
    const doc = new jsPDF();
    let yPosition = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(reportData.title, 20, yPosition);
    yPosition += 10;

    if (reportData.subtitle) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(reportData.subtitle, 20, yPosition);
      yPosition += 10;
    }

    // Metadata
    if (reportData.metadata) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      yPosition += 5;
      
      if (reportData.metadata.department) {
        doc.text(`Secretaria: ${reportData.metadata.department}`, 20, yPosition);
        yPosition += 5;
      }
      
      if (reportData.metadata.period) {
        doc.text(`Período: ${reportData.metadata.period}`, 20, yPosition);
        yPosition += 5;
      }
      
      if (reportData.metadata.generatedBy) {
        doc.text(`Gerado por: ${reportData.metadata.generatedBy}`, 20, yPosition);
        yPosition += 5;
      }
      
      doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 20, yPosition);
      yPosition += 15;
    }

    // Table
    doc.autoTable({
      head: [reportData.headers],
      body: reportData.data,
      startY: yPosition,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
    });

    // Summary
    if (reportData.summary && reportData.summary.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY || yPosition + 100;
      yPosition = finalY + 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo:', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      reportData.summary.forEach((item) => {
        doc.text(`${item.label}: ${item.value}`, 25, yPosition);
        yPosition += 6;
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
      doc.text('DigiUrban - Sistema de Gestão Municipal', 20, doc.internal.pageSize.height - 10);
    }

    // Download
    const fileName = `${reportData.title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  /**
   * Gera relatório em Excel
   */
  static generateExcel(reportData: ReportData): void {
    const workbook = XLSX.utils.book_new();
    
    // Create main data sheet
    const worksheetData = [reportData.headers, ...reportData.data];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Auto-size columns
    const maxLengths = reportData.headers.map((header, index) => {
      const columnData = [header, ...reportData.data.map(row => String(row[index] || ''))];
      return Math.max(...columnData.map(cell => cell.length));
    });

    worksheet['!cols'] = maxLengths.map(length => ({
      wch: Math.min(Math.max(length + 2, 10), 50)
    }));

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');

    // Create summary sheet if available
    if (reportData.summary && reportData.summary.length > 0) {
      const summaryData = [
        ['Resumo do Relatório'],
        [''],
        ['Item', 'Valor'],
        ...reportData.summary.map(item => [item.label, item.value])
      ];

      if (reportData.metadata) {
        summaryData.push(
          [''],
          ['Informações do Relatório'],
          [''],
          ['Campo', 'Valor'],
          ['Título', reportData.title],
          ['Data de Geração', new Date().toLocaleDateString('pt-BR')]
        );

        if (reportData.metadata.department) {
          summaryData.push(['Secretaria', reportData.metadata.department]);
        }
        if (reportData.metadata.period) {
          summaryData.push(['Período', reportData.metadata.period]);
        }
        if (reportData.metadata.generatedBy) {
          summaryData.push(['Gerado por', reportData.metadata.generatedBy]);
        }
      }

      const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumo');
    }

    // Download
    const fileName = `${reportData.title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }
}

// Funções específicas para cada módulo

/**
 * Relatórios da Secretaria de Saúde
 */
export class HealthReports {
  static generateAppointmentsReport(appointments: unknown[], period: string) {
    const data = appointments.map(apt => [
      apt.patientName,
      apt.doctorName,
      apt.specialty,
      new Date(apt.date).toLocaleDateString('pt-BR'),
      apt.time,
      apt.status,
      apt.priority
    ]);

    const summary = [
      { label: 'Total de Agendamentos', value: appointments.length },
      { label: 'Agendamentos Realizados', value: appointments.filter(a => a.status === 'realizado').length },
      { label: 'Agendamentos Cancelados', value: appointments.filter(a => a.status === 'cancelado').length },
      { label: 'Taxa de Comparecimento', value: `${Math.round((appointments.filter(a => a.status === 'realizado').length / appointments.length) * 100)}%` }
    ];

    const reportData: ReportData = {
      title: 'Relatório de Agendamentos Médicos',
      subtitle: 'Consultas médicas agendadas e realizadas',
      headers: ['Paciente', 'Médico', 'Especialidade', 'Data', 'Horário', 'Status', 'Prioridade'],
      data,
      summary,
      metadata: {
        department: 'Secretaria de Saúde',
        period,
        generatedBy: 'Sistema DigiUrban'
      }
    };

    return reportData;
  }

  static generateMedicationReport(medications: unknown[], period: string) {
    const data = medications.map(med => [
      med.name,
      med.category,
      med.stock,
      med.unit,
      med.minimumStock,
      new Date(med.expirationDate).toLocaleDateString('pt-BR'),
      med.batchNumber,
      med.stock < med.minimumStock ? 'Baixo' : 'Adequado'
    ]);

    const lowStockCount = medications.filter(m => m.stock < m.minimumStock).length;
    const expiringSoonCount = medications.filter(m => {
      const expDate = new Date(m.expirationDate);
      const today = new Date();
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return diffDays <= 90;
    }).length;

    const summary = [
      { label: 'Total de Medicamentos', value: medications.length },
      { label: 'Medicamentos com Estoque Baixo', value: lowStockCount },
      { label: 'Medicamentos Próximos ao Vencimento', value: expiringSoonCount },
      { label: 'Taxa de Adequação do Estoque', value: `${Math.round(((medications.length - lowStockCount) / medications.length) * 100)}%` }
    ];

    const reportData: ReportData = {
      title: 'Relatório de Controle de Medicamentos',
      subtitle: 'Situação do estoque de medicamentos',
      headers: ['Medicamento', 'Categoria', 'Estoque', 'Unidade', 'Mínimo', 'Validade', 'Lote', 'Status'],
      data,
      summary,
      metadata: {
        department: 'Secretaria de Saúde',
        period,
        generatedBy: 'Sistema DigiUrban'
      }
    };

    return reportData;
  }
}

/**
 * Relatórios da Secretaria de Educação
 */
export class EducationReports {
  static generateStudentsReport(students: unknown[], period: string) {
    const data = students.map(student => [
      student.name,
      new Date(student.birthDate).toLocaleDateString('pt-BR'),
      student.enrollments[0]?.schoolName || 'N/A',
      student.enrollments[0]?.grade || 'N/A',
      student.enrollments[0]?.className || 'N/A',
      student.enrollments[0]?.status || 'N/A',
      student.guardianPhone
    ]);

    const activeStudents = students.filter(s => s.enrollments[0]?.status === 'active').length;
    const transferredStudents = students.filter(s => s.enrollments[0]?.status === 'transferred').length;

    const summary = [
      { label: 'Total de Alunos', value: students.length },
      { label: 'Alunos Ativos', value: activeStudents },
      { label: 'Alunos Transferidos', value: transferredStudents },
      { label: 'Taxa de Permanência', value: `${Math.round((activeStudents / students.length) * 100)}%` }
    ];

    const reportData: ReportData = {
      title: 'Relatório de Matrículas de Alunos',
      subtitle: 'Lista completa de alunos matriculados',
      headers: ['Nome', 'Data Nascimento', 'Escola', 'Série', 'Turma', 'Status', 'Telefone Responsável'],
      data,
      summary,
      metadata: {
        department: 'Secretaria de Educação',
        period,
        generatedBy: 'Sistema DigiUrban'
      }
    };

    return reportData;
  }

  static generateTransportReport(routes: unknown[], period: string) {
    const data = routes.map(route => [
      route.name,
      route.vehicle.type,
      route.vehicle.plate,
      route.vehicle.driver,
      route.stops.length,
      route.stops.reduce((sum: number, stop: any) => sum + stop.studentsCount, 0),
      `${route.distance} km`,
      route.active ? 'Ativa' : 'Inativa'
    ]);

    const activeRoutes = routes.filter(r => r.active).length;
    const totalStudents = routes.reduce((sum, route) => 
      sum + route.stops.reduce((stopSum: number, stop: any) => stopSum + stop.studentsCount, 0), 0
    );

    const summary = [
      { label: 'Total de Rotas', value: routes.length },
      { label: 'Rotas Ativas', value: activeRoutes },
      { label: 'Estudantes Transportados', value: totalStudents },
      { label: 'Distância Total Diária', value: `${routes.reduce((sum, r) => sum + r.distance, 0).toFixed(1)} km` }
    ];

    const reportData: ReportData = {
      title: 'Relatório de Transporte Escolar',
      subtitle: 'Rotas de transporte e estudantes atendidos',
      headers: ['Rota', 'Tipo Veículo', 'Placa', 'Motorista', 'Paradas', 'Estudantes', 'Distância', 'Status'],
      data,
      summary,
      metadata: {
        department: 'Secretaria de Educação',
        period,
        generatedBy: 'Sistema DigiUrban'
      }
    };

    return reportData;
  }
}

/**
 * Relatórios da Secretaria de Obras Públicas
 */
export class PublicWorksReports {
  static generateWorksReport(works: unknown[], period: string) {
    const data = works.map(work => [
      work.nome,
      work.categoria,
      work.contratada.empresa,
      `R$ ${work.orcamento.valorContratado.toLocaleString()}`,
      `R$ ${work.orcamento.valorExecutado.toLocaleString()}`,
      `${work.cronograma.percentualConcluido}%`,
      new Date(work.cronograma.dataPrevisaoTermino).toLocaleDateString('pt-BR'),
      work.status
    ]);

    const totalValue = works.reduce((sum, w) => sum + w.orcamento.valorContratado, 0);
    const executedValue = works.reduce((sum, w) => sum + w.orcamento.valorExecutado, 0);
    const averageProgress = Math.round(works.reduce((sum, w) => sum + w.cronograma.percentualConcluido, 0) / works.length);

    const summary = [
      { label: 'Total de Obras', value: works.length },
      { label: 'Valor Total Contratado', value: `R$ ${totalValue.toLocaleString()}` },
      { label: 'Valor Total Executado', value: `R$ ${executedValue.toLocaleString()}` },
      { label: 'Progresso Médio', value: `${averageProgress}%` },
      { label: 'Taxa de Execução Financeira', value: `${Math.round((executedValue / totalValue) * 100)}%` }
    ];

    const reportData: ReportData = {
      title: 'Relatório de Obras Públicas',
      subtitle: 'Situação das obras em execução',
      headers: ['Obra', 'Categoria', 'Empresa', 'Valor Contratado', 'Valor Executado', 'Progresso', 'Prazo', 'Status'],
      data,
      summary,
      metadata: {
        department: 'Secretaria de Obras Públicas',
        period,
        generatedBy: 'Sistema DigiUrban'
      }
    };

    return reportData;
  }

  static generateInterventionsReport(interventions: unknown[], period: string) {
    const data = interventions.map(intervention => [
      intervention.numeroOS,
      intervention.descricao,
      intervention.tipo,
      intervention.localizacao.endereco,
      intervention.equipe.responsavel,
      new Date(intervention.agendamento.dataAgendada).toLocaleDateString('pt-BR'),
      `R$ ${intervention.custo.valorEstimado.toLocaleString()}`,
      intervention.status
    ]);

    const totalCost = interventions.reduce((sum, i) => sum + i.custo.valorEstimado, 0);
    const completedCount = interventions.filter(i => i.status === 'concluida').length;

    const summary = [
      { label: 'Total de Intervenções', value: interventions.length },
      { label: 'Intervenções Concluídas', value: completedCount },
      { label: 'Custo Total Estimado', value: `R$ ${totalCost.toLocaleString()}` },
      { label: 'Taxa de Conclusão', value: `${Math.round((completedCount / interventions.length) * 100)}%` }
    ];

    const reportData: ReportData = {
      title: 'Relatório de Pequenas Intervenções',
      subtitle: 'Serviços de manutenção e pequenos reparos',
      headers: ['OS', 'Descrição', 'Tipo', 'Localização', 'Responsável', 'Data Agendada', 'Custo', 'Status'],
      data,
      summary,
      metadata: {
        department: 'Secretaria de Obras Públicas',
        period,
        generatedBy: 'Sistema DigiUrban'
      }
    };

    return reportData;
  }
}

/**
 * Funções utilitárias para formatação
 */
export const formatters = {
  currency: (value: number): string => `R$ ${value.toLocaleString('pt-BR')}`,
  percentage: (value: number): string => `${value.toFixed(1)}%`,
  date: (date: string): string => new Date(date).toLocaleDateString('pt-BR'),
  datetime: (date: string): string => new Date(date).toLocaleString('pt-BR'),
};