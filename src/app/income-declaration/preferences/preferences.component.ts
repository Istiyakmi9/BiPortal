import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { AdminDeclaration, AdminSalary, AdminSummary } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { EmployeeDetail } from 'src/app/adminmodal/admin-modals';
import { UserService } from 'src/providers/userService';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit {
  PanInformation: PANInformation = new PANInformation();
  salaryDeposit: SalaryDeposit = new SalaryDeposit();
  satutoryInformation: StatutoryInformation = new StatutoryInformation();
  cachedData: any = null;
  employeeDetail: EmployeeDetail = new EmployeeDetail();
  EmployeeId: number = 0;
  isPageReady: boolean = false;
  userDetail: UserDetail = new UserDetail();

  constructor(private nav: iNavigation,
              private user: UserService,
              private local: ApplicationStorage,
              private http: AjaxService) { }

  ngOnInit(): void {
    this.satutoryInformation = {
      PFStatus: 'Enabled',
      PFNumber: 11,
      UniversalACNumber: 123456789123,
      PFJoinDate: new Date(),
      NameOfAcccount: 'MD ISTAYAQUE',
      ESIStatus: 'Not Eligible',
      State: 'Telangana',
      RegisteredLocation: 'Telangana',
      LWFStatus: "Disabled"
    }

    this.userDetail = this.user.getInstance();
    let empid = this.local.getByKey("EmployeeId");
    if (empid)
      this.EmployeeId = empid;
    else
      this.EmployeeId = this.userDetail.UserId;

    this.LoadData();
  }

  LoadData() {
    this.isPageReady= false;
    if (this.EmployeeId > 0) {
      this.http.get(`employee/GetEmployeeById/${this.EmployeeId}/1`).then((response: ResponseModel) => {
        if(response.ResponseBody) {
          if (response.ResponseBody) {
            this.employeeDetail = response.ResponseBody;
            this.employeeDetail.DOB = new Date(this.employeeDetail.DOB);
            Toast("Record found.")
          } else {
            ErrorToast("Record not found");
          }
          this.isPageReady= true;
        }
      }).catch(e => {
        ErrorToast("No record found");
      });
    }
  }

  activateMe(ele: string) {
    switch(ele) {
      case "declaration-tab":
        this.nav.navigateRoot(AdminDeclaration, this.cachedData);
      break;
      case "salary-tab":
        this.nav.navigateRoot(AdminSalary, this.cachedData);
      break;
      case "summary-tab":
        this.nav.navigateRoot(AdminSummary, this.cachedData);
      break;
      case "preference-tab":
        break;
    }
  }
}

class PANInformation {
  NameOnCard: string = '';
  PANNo: string = '';
  DOB: Date = null;
  FatherName : string = ''
}

class SalaryDeposit {
  PaymentMode: string = '';
  Bank: string = '';
  ACNumber: number = null;
  IFSCCode: string = '';
  NameOnAccount: string = ''
}

class StatutoryInformation {
  PFStatus: string = '';
  PFNumber: number = 0;
  UniversalACNumber: number = 0;
  PFJoinDate: Date = null;
  NameOfAcccount: string = '';
  ESIStatus: string = '';
  State: string = '';
  RegisteredLocation: string = '';
  LWFStatus: string = ''
}
