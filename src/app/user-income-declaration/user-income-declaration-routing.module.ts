import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PreviousincomeComponent } from '../user-income-declaration/previousincome/previousincome.component';
import { Form12BBComponent } from '../user-income-declaration/form12-bb/form12-bb.component';
import { PayslipsComponent } from '../user-income-declaration/payslips/payslips.component';
import { IncometaxComponent } from '../user-income-declaration/incometax/incometax.component';
import { DeclarationComponent } from '../user-income-declaration/declaration/declaration.component';
import { MysalaryComponent } from '../user-income-declaration/mysalary/mysalary.component';
import { PreferencesComponent } from '../user-income-declaration/preferences/preferences.component';
import { Declaration, Form12B, FreeTaxFilling, IncomeTax, PaySlip, Preferences, PreviousIncome, Salary, Summary, TaxSavingInvestment } from 'src/providers/constants';

const routes: Routes = [
  { path: Declaration, component: DeclarationComponent},
  { path: Salary, component: MysalaryComponent},
  { path: Preferences, component: PreferencesComponent},
  { path: PreviousIncome, component: PreviousincomeComponent},
  { path: Form12B, component: Form12BBComponent},
  { path: PaySlip, component: PayslipsComponent},
  { path: IncomeTax, component: IncometaxComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserIncomeDeclarationRoutingModule { }
