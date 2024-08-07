import { CommonModule } from '@angular/common';
import { CommonRoutingModule } from './util-routing.module';
import { UtilComponent } from './util.component';
import { AllownumberDirective } from './directives/allownumber.directive';
import { DecimalnumberDirective } from './directives/decimalnumber.directive';
import { TransformDirective } from './directives/transform.directive';
import { PaginationComponent } from '../pagination/pagination.component';
import { BreadcrumsComponent } from './breadcrums/breadcrums.component';
import { IautocompleteComponent } from "./iautocomplete/iautocomplete.component";
import { EditorComponent } from './editor/editor.component';
import { MessageModalComponent } from './message-modal/message-modal.component'
import { FormsModule } from '@angular/forms';
import { BhTimepickerComponent } from './bh-timepicker/bh-timepicker.component'
import { NgModule } from '@angular/core';
import { BotTreeViewComponent } from './bot-tree-view/bot-tree-view.component';
import { ImageLoaderComponent } from './image-loader/image-loader.component';
import { PagePlaceholderComponent } from './page-placeholder/page-placeholder.component';
import { CardWidgetComponent } from '../util/card-widget/card-widget.component';
import { BtButtonComponent } from '../util/bt-button/bt-button.component';
import { BtChipComponent } from '../util/bt-chip/bt-chip.component';
import { ButtonSubmitComponent } from './button-submit/button-submit.component';
import { ButtonCancelComponent } from './button-cancel/button-cancel.component';

@NgModule({
  declarations: [
    UtilComponent,
    AllownumberDirective,
    DecimalnumberDirective,
    TransformDirective,
    PaginationComponent,
    IautocompleteComponent,
    BreadcrumsComponent,
    EditorComponent,
    MessageModalComponent,
    BhTimepickerComponent,
    BotTreeViewComponent,
    ImageLoaderComponent,
    PagePlaceholderComponent,
    CardWidgetComponent,
    BtButtonComponent,
    BtChipComponent,
    ButtonSubmitComponent,
    ButtonCancelComponent
  ],
  imports: [
    CommonModule,
    CommonRoutingModule,
    FormsModule
  ],
  exports: [
    AllownumberDirective,
    TransformDirective,
    DecimalnumberDirective,
    PaginationComponent,
    BreadcrumsComponent,
    IautocompleteComponent,
    EditorComponent,
    MessageModalComponent,
    BhTimepickerComponent,
    BotTreeViewComponent,
    ImageLoaderComponent,
    PagePlaceholderComponent,
    CardWidgetComponent,
    BtButtonComponent,
    ButtonSubmitComponent,
    BtChipComponent,
    ButtonCancelComponent
  ]
})
export class UtilModule {
  constructor() {
    console.log("Util module loaded");
  }
}
