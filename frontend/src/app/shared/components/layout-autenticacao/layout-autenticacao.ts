import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-layout-autenticacao',
  templateUrl: './layout-autenticacao.html',
})
export class LayoutAutenticacao {
  @Input() destaqueTitulo = '';
  @Input() destaqueDescricao = '';
  @Input() painelAmplo = false;
}
