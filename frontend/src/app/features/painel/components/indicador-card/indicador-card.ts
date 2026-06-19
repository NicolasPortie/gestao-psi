import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-indicador-card',
  templateUrl: './indicador-card.html',
})
export class IndicadorCard {
  @Input({ required: true }) icone = '';
  @Input({ required: true }) valor: string | number = '';
  @Input({ required: true }) rotulo = '';
  @Input() tom: 'principal' | 'erro' | 'neutro' = 'principal';
}
