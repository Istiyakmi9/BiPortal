import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import 'bootstrap';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-pf-esi-setup',
  templateUrl: './pf-esi-setup.component.html',
  styleUrls: ['./pf-esi-setup.component.scss']
})
export class PfEsiSetupComponent implements OnInit, AfterViewChecked {
  PFandESIForm: FormGroup;
  pfesiSetting: pfesisetting = null;
  IsReady: boolean = false;
  isLoading: boolean = false;
  isallowChild: boolean = false;
  isallowPFamount:boolean = false;
  isallowPFLimit: boolean = false;
  companyId: number = 0;

  constructor(
    private fb: FormBuilder,
    private http: CoreHttpService,
    private nav: iNavigation
  ) { }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip();
  }

  ngOnInit(): void {
    let data = this.nav.getValue();
    if (data > 0) {
      this.companyId = data;
      this.loadData();
    }
    else
      ErrorToast("Please select comopany first");
  }

  loadData() {
    this.IsReady = false;
    this.http.get(`Settings/GetSalaryComponents/${this.companyId}`).then(res => {
      if(res.ResponseBody) {
        this.IsReady = true;
        this.pfesiSetting = res.ResponseBody;
        this.initForm();
        Toast("Page data loaded successfully.");
      } else {
        ErrorToast("Page data loaded successfully.");
      }
    }).catch(e => {
      this.IsReady = true;
    });
  }

  initForm() {
    this.PFandESIForm = this.fb.group({
      PFEnable: new FormControl (this.pfesiSetting.PFEnable? 'true' : 'false'),
      IsPfAmountLimitStatutory: new FormControl(this.pfesiSetting.IsPfAmountLimitStatutory),
      IsPfCalculateInPercentage: new FormControl(this.pfesiSetting.IsPfCalculateInPercentage),
      IsAllowOverridingPf: new FormControl (this.pfesiSetting.IsAllowOverridingPf),
      IsPfEmployerContribution: new FormControl (this.pfesiSetting.IsPfEmployerContribution),
      EmployerPFLimit: new FormControl (this.pfesiSetting.EmployerPFLimit),
      IsHidePfEmployer: new FormControl (this.pfesiSetting.IsHidePfEmployer),
      IsPayOtherCharges: new FormControl (this.pfesiSetting.IsPayOtherCharges),
      IsAllowVPF: new FormControl (this.pfesiSetting.IsAllowVPF),
      EsiEnable: new FormControl (this.pfesiSetting.EsiEnable? 'true' : 'false'),
      MaximumGrossForESI: new FormControl (this.pfesiSetting.MaximumGrossForESI),
      EsiEmployeeContribution: new FormControl (this.pfesiSetting.EsiEmployeeContribution),
      EsiEmployerContribution: new FormControl (this.pfesiSetting.EsiEmployerContribution),
      IsAllowOverridingEsi: new FormControl (this.pfesiSetting.IsAllowOverridingEsi),
      IsHideEsiEmployer: new FormControl(this.pfesiSetting.IsHideEsiEmployer),
      IsEsiExcludeEmployerShare: new FormControl(this.pfesiSetting.IsEsiExcludeEmployerShare),
      IsEsiExcludeEmployeeGratuity: new FormControl(this.pfesiSetting.IsEsiExcludeEmployeeGratuity),
      IsEsiEmployerContributionOutside: new FormControl(this.pfesiSetting.IsEsiEmployerContributionOutside),
      IsRestrictEsi: new FormControl(this.pfesiSetting.IsRestrictEsi),
      IsIncludeBonusEsiEligibility: new FormControl(this.pfesiSetting.IsIncludeBonusEsiEligibility),
      IsIncludeBonusEsiContribution: new FormControl(this.pfesiSetting.IsIncludeBonusEsiContribution),
      IsEmployerPFLimitContribution: new FormControl(this.pfesiSetting.IsEmployerPFLimitContribution),
      CompanyId: new FormControl(this.companyId),
      PfEsi_setting_Id: new FormControl(this.pfesiSetting.PfEsi_setting_Id)
    })
  }

  submitPFESISetting() {
    this.isLoading = true;
    let data:pfesisetting = this.PFandESIForm.value;

    if (data.IsPfEmployerContribution == false) {
      data.IsEmployerPFLimitContribution = false;
      data.EmployerPFLimit = 0;
    }

    if (data.IsPfCalculateInPercentage == false)
      data.IsAllowOverridingPf = false;

    this.http.put(`Settings/PfEsiSetting/${this.companyId}`, data).then((response:ResponseModel) => {
      if (response.ResponseBody) {
        Toast("Setting changed")
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  enableChildList(e: any) {
    let data = e.target.checked;
    if (data == false) {
      document.querySelector('[name="IsAllowOverridingPf"]').setAttribute("disabled", '');
      let value = document.querySelector('[name="IsAllowOverridingPf"]')as HTMLInputElement;
      value.checked = false;
    } else {
      document.querySelector('[name="IsAllowOverridingPf"]').removeAttribute("disabled");
    }
    this.isallowChild = !this.isallowChild;
  }

  allowPFContribution(e: any) {
    let data = e.target.checked;
    if (data == false) {
      document.querySelector('[name="IsEmployerPFLimitContribution"]').setAttribute("disabled", '');
      let value = document.querySelector('[name="IsEmployerPFLimitContribution"]')as HTMLInputElement;
      value.checked = false;
      this.isallowPFamount = false;
    } else {
      document.querySelector('[name="IsEmployerPFLimitContribution"]').removeAttribute("disabled");
    }
    this.isallowPFLimit = !this.isallowPFLimit;
  }

  enablePfAmount(e: boolean) {
    this.isallowPFamount = !this.isallowPFamount;
  };

  pfStatusChange(e: any) {
    let value = e.target.value;
    let elem = document.querySelectorAll('input[data-name="pf-setting"]');
    if (value == "true") {
      if (elem.length > 0) {
        for (let i = 0; i < elem.length; i++) {
          if (elem[i].attributes.getNamedItem('disabled') != null)
            elem[i].removeAttribute('disabled');
        }
        this.pfesiSetting.PFEnable = true;
        this.PFandESIForm.get('PFEnable').setValue('true');
      }
    } else {
      if (elem.length > 0) {
        for (let i = 0; i < elem.length; i++) {
          elem[i].setAttribute('disabled', '');
        }
        this.pfesiSetting.PFEnable = false;
        this.PFandESIForm.get('PFEnable').setValue(false);
        this.pfesiSetting.IsPfAmountLimitStatutory = false;
        this.pfesiSetting.IsPfCalculateInPercentage = false;
        this.pfesiSetting.IsAllowOverridingPf = false;
        this.pfesiSetting.IsPfEmployerContribution = false;
        this.pfesiSetting.IsEmployerPFLimitContribution = false;
        this.pfesiSetting.IsHidePfEmployer = false;
        this.pfesiSetting.IsPayOtherCharges = false;
        this.pfesiSetting.IsAllowVPF = false;
        this.pfesiSetting.EmployerPFLimit = 0;
        this.initForm();
      }
    }
  }

  esiStatusChange(e: any) {
    let value = e.target.value;
    let elem = document.querySelectorAll('input[ data-name="esi-setting" ]');
    if (value == "true") {
      if (elem.length > 0) {
        for (let i = 0; i < elem.length; i++) {
          elem[i].removeAttribute('disabled');
        }
        this.pfesiSetting.EsiEnable = true;
        this.PFandESIForm.get('EsiEnable').setValue('true');
      }
    } else {
      if (elem.length > 0) {
        for (let i = 0; i < elem.length; i++) {
          elem[i].setAttribute('disabled', '');
        }
        this.pfesiSetting.EsiEnable = false;
        this.PFandESIForm.get('EsiEnable').setValue(false);
        this.pfesiSetting.MaximumGrossForESI = 0;
        this.pfesiSetting.EsiEmployeeContribution = 0;
        this.pfesiSetting.EsiEmployerContribution = 0;
        this.pfesiSetting.IsAllowOverridingEsi = false;
        this.pfesiSetting.IsEsiEmployerContributionOutside = false;
        this.pfesiSetting.IsHideEsiEmployer = false;
        this.pfesiSetting.IsEsiExcludeEmployerShare = false;
        this.pfesiSetting.IsEsiExcludeEmployeeGratuity = false;
        this.pfesiSetting.IsRestrictEsi = false;
        this.pfesiSetting.IsIncludeBonusEsiEligibility = false;
        this.pfesiSetting.IsIncludeBonusEsiContribution = false;
        this.initForm();
      }
    }
  }
}

class pfesisetting {
  PfEsi_setting_Id: number = 0;
  PFEnable: boolean = false;
  IsPfAmountLimitStatutory: boolean = false;
  IsPfCalculateInPercentage: boolean = false;
  IsAllowOverridingPf: boolean = false;
  IsPfEmployerContribution: boolean = false;
  IsHidePfEmployer: boolean = false;
  IsPayOtherCharges: boolean = false;
  IsAllowVPF: boolean = false;
  EsiEnable: boolean = false;
  IsAllowOverridingEsi: boolean = false;
  IsHideEsiEmployer: boolean = false;
  IsEsiExcludeEmployerShare: boolean = false;
  IsEsiExcludeEmployeeGratuity: boolean = false;
  IsEsiEmployerContributionOutside: boolean = false;
  IsRestrictEsi: boolean = false;
  IsIncludeBonusEsiEligibility: boolean = false;
  IsIncludeBonusEsiContribution: boolean = false;
  IsEmployerPFLimitContribution: boolean = false;
  EmployerPFLimit: number = 0;
  MaximumGrossForESI: number = 0;
  EsiEmployeeContribution: number = 0;
  EsiEmployerContribution: number = 0;
  CompanyId: number = 0;
}
