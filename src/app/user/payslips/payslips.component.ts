import { Component, OnInit } from '@angular/core';
import { Declaration, IncomeTax, PaySlip, Preferences, Salary, Summary } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-payslips',
  templateUrl: './payslips.component.html',
  styleUrls: ['./payslips.component.scss']
})
export class PayslipsComponent implements OnInit {
  cachedData: any = null;
  paySlipSchedule: Array<any> = [];
  currentYear: number = 0;

  constructor(private nav: iNavigation) { }

  ngOnInit(): void {
    var dt = new Date();
    this.currentYear = dt.getFullYear();
    this.payslip();
  }

  activateMe(ele: string) {
    switch(ele) {
      case "declaration-tab":
        this.nav.navigateRoot(Declaration, this.cachedData);
        break;
      case "salary-tab":
        break;
      case "summary-tab":
        this.nav.navigateRoot(Summary, this.cachedData);
        break;
      case "preference-tab":
        this.nav.navigateRoot(Preferences, this.cachedData);
        break;
    }
  }

  activeTab(e: string) {
    switch(e) {
      case "MySalary":
        this.nav.navigateRoot(Salary, this.cachedData);
        break;
      case "PaySlips":
        break;
      case "IncomeTax":
        this.nav.navigateRoot(IncomeTax, this.cachedData);
        break;
    }
  }

  allPaySlip(e: any) {
    let yearValue = Number (e.target.value);
    if (yearValue == new Date().getFullYear()) {
      this.paySlipSchedule = []
      this.payslip();
    } else {
      this.paySlipSchedule = []
      var date = new Date();
      let mnth= 12;
      let years = date.getFullYear() - 1;
      let i =0;
      while (i < 12) {
        if (mnth == 1) {
          mnth = 12;
        } else {
          mnth --;
        }
        this.paySlipSchedule.push({
          paySlipMonth: new Date(years, mnth, 1).toLocaleString("en-us", { month: 'short'}),
          paySlipYear: years
        })
        i++;
      }
    }
  }

  payslip() {
    var date = new Date();
    let mnth= date.getMonth();
    let years = date.getFullYear();
    let i =0;
    while (i < date.getMonth()) {
      if (mnth == 1) {
        mnth = 12;
        years --
      } else {
        mnth --;
      }
      this.paySlipSchedule.push({
        paySlipMonth: new Date(years, mnth, 1).toLocaleString("en-us", { month: 'short'}),
        paySlipYear: years
      })
      i++;
    }
  }

}
