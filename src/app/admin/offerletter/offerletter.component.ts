import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';

@Component({
  selector: 'app-offerletter',
  templateUrl: './offerletter.component.html',
  styleUrls: ['./offerletter.component.scss']
})
export class OfferletterComponent implements OnInit {
  isPageReady: boolean = true;
  htmlText: any = null;
  isLoading: boolean = false;
  companyId: number = 0;
  offerletterForm: FormGroup;
  currentOfferLetter: AnnexureOfferLeter = new AnnexureOfferLeter();
  currentCompany: any = null;

  constructor(private http: AjaxService,
              private fb: FormBuilder,
              private local: ApplicationStorage) { }

  ngOnInit(): void {
    let companies = this.local.findRecord("Companies");
    if (companies) {
      this.currentCompany = companies.find(x => x.IsPrimaryCompany == 1);
      if (!this.currentCompany) {
        ErrorToast("Fail to get company detail. Please contact to admin.");
        return;
      } else {
        this.isPageReady = true;
        this.companyId = this.currentCompany.CompanyId;
        this.loadData();
      }
    }
  }

  loadData() {
    this.isPageReady = false;
    this.http.get(`Template/GetAnnexureOfferLetter/${this.companyId}/1`).then(res => {
      if (res.ResponseBody) {
        this.buildData(res.ResponseBody);
        this.isPageReady = true;
      }
    }).catch(e => {
      this.isPageReady = true;
      ErrorToast("Invalid template selected");
    })
  }

  buildData(res: any) {
    this.currentOfferLetter = res;
    this.htmlText = res.BodyContent;
    this.initForm();
  }

  initForm() {
    this.offerletterForm = this.fb.group({
      AnnexureOfferLetterId: new FormControl(this.currentOfferLetter.AnnexureOfferLetterId),
      CompanyId: new FormControl(this.companyId),
      CompanyName: new FormControl(this.currentCompany.CompanyName),
      TemplateName: new FormControl(this.currentOfferLetter.TemplateName),
      BodyContent: new FormControl(this.currentOfferLetter.BodyContent),
      FileId: new FormControl(this.currentOfferLetter.FileId),
    })
  }

  saveofferletter() {
    this.isLoading = true;
    let data = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.innerHTML;
    if (data && data == "" && this.offerletterForm.invalid) {
      this.isLoading = false;
      return;
    }
    let value = this.offerletterForm.value;
    value.BodyContent = data;
    let LetterType = 1;
    this.http.post(`Template/AnnexureOfferLetterInsertUpdate/${LetterType}`, value).then((res:ResponseModel) => {
      if (res.ResponseBody && res.ResponseBody != '') {
        let data = res.ResponseBody;
        this.buildData(data);
        Toast("Template inserted/ updated successfully.");
      }
      this.isLoading = false;
    }).catch(e => {
      this.isLoading = false;
    })
  }

  generateOfferLetter() {
    this.http.post("Employee/GenerateOfferLetter", this.companyId).then(res => {
      if (res.ResponseBody)
        Toast("Offer letter generated successfully");
    })
  }

}


class AnnexureOfferLeter {
  AnnexureOfferLetterId: number= 0;
  CompanyId: number= 0;
  CompanyName: string= '';
  TemplateName: string= '';
  BodyContent: string= '';
  FileId: number= 0;
}
