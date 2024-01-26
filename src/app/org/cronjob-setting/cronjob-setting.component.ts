import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast } from 'src/providers/common-service/common.service';
import { CronJobType } from 'src/providers/constants';

@Component({
  selector: 'app-cronjob-setting',
  templateUrl: './cronjob-setting.component.html',
  styleUrls: ['./cronjob-setting.component.scss']
})
export class CronjobSettingComponent implements OnInit {
  crobJobForm: FormGroup;
  isLoading: boolean = false;
  cronJobDetail: CronJobSetting = {
    LeaveAccrualCronDay: 0,
    LeaveAccrualCronTime: 0,
    LeaveAccrualCronType: 0,
    TimesheetCronDay: 0,
    TimesheetCronTime: 0,
    TimesheetCronType: 0,
    LeaveYearEndCronDay: 0,
    LeaveYearEndCronTime: 0,
    LeaveYearEndCronType: 0,
  }
  constructor (private http: AjaxService,
              private fb: FormBuilder){}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.crobJobForm = this.fb.group({
      LeaveAccrualCronType: new FormControl(this.cronJobDetail.LeaveAccrualCronType),
      LeaveAccrualCronDay: new FormControl(this.cronJobDetail.LeaveAccrualCronDay),
      LeaveAccrualCronTime: new FormControl(this.cronJobDetail.LeaveAccrualCronTime),
      TimesheetCronType: new FormControl(this.cronJobDetail.TimesheetCronType),
      TimesheetCronDay: new FormControl(this.cronJobDetail.TimesheetCronDay),
      TimesheetCronTime: new FormControl(this.cronJobDetail.TimesheetCronTime),
      LeaveYearEndCronType: new FormControl(this.cronJobDetail.LeaveYearEndCronType),
      LeaveYearEndCronDay: new FormControl(this.cronJobDetail.LeaveYearEndCronDay),
      LeaveYearEndCronTime: new FormControl(this.cronJobDetail.LeaveYearEndCronTime)
    })
  }

  get f() {
    return this.crobJobForm.controls;
  }

  saveCronSetting() {
    this.isLoading = true;
    console.log(this.crobJobForm.value)
    if (this.crobJobForm.invalid) {
      ErrorToast("Please select select or fill all the fields");
      this.isLoading = false;
    }
    let value:CronJobSetting = this.crobJobForm.value;
    let errorCount = 0;
    if (value.LeaveAccrualCronType == CronJobType.Weekly || value.LeaveAccrualCronType == CronJobType.Monthly || value.LeaveAccrualCronType == CronJobType.Yearly) {
      if (value.LeaveAccrualCronDay == 0) {
        errorCount++;
        ErrorToast("Please select leave cron job day");
      }
    }

    if (value.TimesheetCronType == CronJobType.Weekly || value.TimesheetCronType == CronJobType.Monthly || value.TimesheetCronType == CronJobType.Yearly) {
      if (value.TimesheetCronDay == 0) {
        errorCount++;
        ErrorToast("Please select timesheet cron job day");
      }
    }

    if (value.LeaveYearEndCronType == CronJobType.Weekly || value.LeaveYearEndCronType == CronJobType.Monthly || value.LeaveYearEndCronType == CronJobType.Yearly) {
      if (value.LeaveYearEndCronDay == 0) {
        errorCount++;
        ErrorToast("Please select cron job day");
      }
    }

    if (errorCount === 0) {
      this.http.post("", value).then((res: ResponseModel) => {
        if (res.ResponseBody) {
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      })
    } else {
      this.isLoading = false;
    }
  }
}

interface CronJobSetting {
  LeaveAccrualCronType: number,
  LeaveAccrualCronDay: number,
  LeaveAccrualCronTime: number,
  TimesheetCronType: number,
  TimesheetCronDay: number,
  TimesheetCronTime: number,
  LeaveYearEndCronType: number,
  LeaveYearEndCronDay: number,
  LeaveYearEndCronTime: number
}
