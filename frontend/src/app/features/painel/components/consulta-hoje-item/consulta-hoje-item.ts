import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PainelConsultaHoje } from '../../models/painel.model';

@Component({
  selector: 'app-consulta-hoje-item',
  imports: [NgClass, RouterLink],
  templateUrl: './consulta-hoje-item.html',
})
export class ConsultaHojeItem {
  @Input({ required: true }) consulta!: PainelConsultaHoje;

  protected obterClasseStatus(status: string): string {
    if (status === 'Confirmada' || status === 'Agendada') {
      return 'bg-[#c6eccd] text-[#2d4e37]';
    }

    if (status === 'AguardandoConfirmacao') {
      return 'bg-[#eae1d9]/70 text-[#5a554f]';
    }

    if (status === 'NaoCompareceu') {
      return 'bg-[#ffdad6]/70 text-[#ba1a1a]';
    }

    return 'bg-[#f1f4fb] text-[#5a554f]';
  }
}
