import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PainelAlerta } from '../../models/painel.model';

@Component({
  selector: 'app-alerta-painel-item',
  imports: [NgClass, RouterLink],
  templateUrl: './alerta-painel-item.html',
})
export class AlertaPainelItem {
  @Input({ required: true }) alerta!: PainelAlerta;

  protected icone(): string {
    if (this.alerta.tipo === 'erro') {
      return 'pi-exclamation-circle';
    }

    if (this.alerta.tipo === 'whatsapp') {
      return 'pi-comments';
    }

    return 'pi-info-circle';
  }

  protected tom(): string {
    if (this.alerta.tipo === 'erro') {
      return 'bg-[#ffdad6]/45 text-[#ba1a1a]';
    }

    if (this.alerta.tipo === 'whatsapp') {
      return 'bg-[#c6eccd]/40 text-[#44664e]';
    }

    return 'bg-[#eae1d9]/45 text-[#5a554f]';
  }
}
