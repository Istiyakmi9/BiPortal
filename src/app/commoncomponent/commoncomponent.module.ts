import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommoncomponentRoutingModule } from './commoncomponent-routing.module';
import {PerformanceComponent} from './performance/performance.component'
import { UtilModule } from '../util/util.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonmodalModule } from '../commonmodal/commonmodal.module';

@NgModule({
  declarations: [
    PerformanceComponent
  ],
  imports: [
    CommonModule,
    UtilModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    CommonmodalModule,
    CommoncomponentRoutingModule
  ]
})
export class CommoncomponentModule { }
