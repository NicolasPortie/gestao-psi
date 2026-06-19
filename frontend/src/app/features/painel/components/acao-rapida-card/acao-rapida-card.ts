import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PainelAcaoRapida } from '../../models/painel.model';

@Component({
  selector: 'app-acao-rapida-card',
  imports: [NgClass, RouterLink],
  templateUrl: './acao-rapida-card.html',
})
export class AcaoRapidaCard {
  @Input({ required: true }) acao!: PainelAcaoRapida;
}
