import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Chart } from 'chart.js';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-employee-performance',
  templateUrl: './employee-performance.component.html',
  styleUrls: ['./employee-performance.component.scss']
})
export class EmployeePerformanceComponent implements OnInit {
  employeeUid: number = 0;
  employeeDetails: any = null;
  allocatedClients: any = null;
  performanceMonthsYears: Array<any> = [];
  currentPerformance: any = null;
  isActive: boolean = false;
  daysInMonth: Array<number> = [];
  graphInstances: Array<any> = [];
  months: Array<string> = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  attendanceData: Array<any> = [];
  isMonthlyRecordFound: boolean = false;
  monthlyWorkingHour: Array<number> = [];
  monthlyBurningHour: Array<number> =[];
  monthlyGapHour: Array<number> = [];
  // ---------------------------------------
  isPageReady: boolean = true;
  isLoading: boolean = false;
  objectForm: FormGroup;
  currentObject: Objective = new Objective();
  htmlText: any = null;
  startDate: NgbDateStruct;
  endDate: NgbDateStruct;
  isFileFound: boolean = false;
  objectDetail: Objective = new Objective();
  objectiveData: Filter = new Filter();
  orderByObjectiveAsc: boolean = null;
  orderByStartDateAsc: boolean = null;
  orderByEndDateAsc: boolean = null;
  orderBTargetValueAsc: boolean = null;

  constructor(private nav:iNavigation,
              private http: AjaxService,
              private fb: FormBuilder,
              private local: ApplicationStorage) { }

  ngOnInit(): void {
    let data = this.nav.getValue();
    let company = this.local.findRecord("Companies");
    if(data && data != null) {
      this.employeeDetails = data;
      this.employeeUid = data.EmployeeUid;
    } else
      ErrorToast("Invalid user. Please login again.");

    if(company)
      this.allocatedClients = company.find(x => x.CompanyId == this.employeeDetails.CompanyId);
    // let date = new Date();
    // this.loadData(date.getMonth()+1, date.getFullYear());
    // this.findNoOfDaysinMonth(date.getMonth(), date.getFullYear());
    // this.getLastFourMonth();
    // this.DestroyGraphInstances();
    // this.performanceMonthsYears[0].isActive = false;
    // this.currentPerformance = {
    //     month: this.performanceMonthsYears[0].months,
    //     year: this.performanceMonthsYears[0].years,
    //   }
    this.initForm();
  }

  loadData() {

  }

  initForm() {
    this.objectForm = this.fb.group({
      Objective: new FormControl(this.currentObject.Objective),
      ObjSeeType: new FormControl(this.currentObject.ObjSeeType ? 'true' :'false'),
      IsIncludeReview: new FormControl(this.currentObject.IsIncludeReview),
      Tag: new FormControl(this.currentObject.Tag),
      ProgressMeassureType: new FormControl(this.currentObject.ProgressMeassureType == 1 ? '1' : this.currentObject.ProgressMeassureType == 2 ? '2' : '3'),
      StartValue: new FormControl(this.currentObject.StartValue),
      TargetValue: new FormControl(this.currentObject.TargetValue),
      Description: new FormControl(''),
      TimeFrameStart: new FormControl(),
      TimeFrmaeEnd: new FormControl(),
      MetricUnits: new FormControl(this.currentObject.MetricUnits),
      ProgressCalculatedAs: new FormControl(this.currentObject.ProgressCalculatedAs),
    })
  }

  addObjectivePopUp() {
    $('#addObjectiveModal').modal('show');
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.objectForm.controls["TimeFrameStart"].setValue(date);
  }

  onEndDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.objectForm.controls["TimeFrmaeEnd"].setValue(date);
  }

  addObjective() {
    let data = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.innerHTML;
    let value = this.objectForm.value;
    if (data)
      value.Description = data;

    console.log(value);
  }

  resetFilter() {
    this.objectiveData.SearchString = "1=1";
    this.objectiveData.PageIndex = 1;
    this.objectiveData.PageSize = 10;
    this.objectiveData.StartIndex = 1;
    this.objectiveData.EndIndex = (this.objectiveData.PageSize * this.objectiveData.PageIndex);
    this.loadData();
    this.objectDetail.Objective="";
    this.objectDetail.TargetValue = 0;
    this.objectDetail.TimeFrameStart=new Date();
    this.objectDetail.TimeFrmaeEnd=new Date();
  }

  filterRecords() {
    let searchQuery = "";
    let delimiter = "";
    this.objectiveData.reset();

    if(this.objectDetail.Objective !== null && this.objectDetail.Objective !== "") {
        searchQuery += ` Objective like '${this.objectDetail.Objective}%'`;
        delimiter = "and";
      }

    if(this.objectDetail.TargetValue !== null && this.objectDetail.TargetValue !== 0) {
      searchQuery += ` ${delimiter} TargetValue = ${this.objectDetail.TargetValue} `;
        delimiter = "and";
    }
    if(this.objectDetail.TimeFrameStart !== null) {
      searchQuery += ` ${delimiter} PrimaryPhoneNo like '%${this.objectDetail.TimeFrameStart}%' `;
        delimiter = "and";
    }
    if(this.objectDetail.TimeFrmaeEnd !== null ) {
      searchQuery += ` ${delimiter} TimeFrmaeEnd like '${this.objectDetail.TimeFrmaeEnd}%' `;
        delimiter = "and";
    }

    if(searchQuery !== "") {
      this.objectiveData.SearchString = `1=1 And ${searchQuery}`;
    }

    this.loadData();
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'Asc';
    } else {
      Order = 'Desc';
    }
    if (FieldName == 'Objective')
      this.orderByObjectiveAsc = !flag;
    if (FieldName == 'StartDate')
      this.orderByStartDateAsc = !flag;
    if (FieldName == 'EndDate')
      this.orderByEndDateAsc = !flag;
    if (FieldName == 'TargetValue')
      this.orderBTargetValueAsc = !flag;

    this.objectiveData = new Filter();
    this.objectiveData.SortBy = FieldName +" "+ Order;
    this.loadData()
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.objectiveData = e;
      this.loadData();
    }
  }

  // loadData(month: number, year: number) {
  //   this.isMonthlyRecordFound = false;
  //   let value = {
  //     EmployeeUid: this.employeeUid,
  //     UserTypeId: this.employeeDetails.UserTypeId,
  //     ForYear: year,
  //     ForMonth: month
  //   }
  //   this.http.post("Attendance/GetEmployeePerformance", value).then((res:ResponseModel) => {
  //     if (res.ResponseBody) {
  //       this.bindMonthlyPerformance(res.ResponseBody);
  //       this.bindYearlyPerformance(res.ResponseBody);
  //     }
  //   })
  // }

  // bindMonthlyPerformance(res) {
  //   let toDate = new Date();
  //   this.attendanceData = [];
  //   if (res.MonthlyAttendance) {
  //     let attendance = JSON.parse(res.MonthlyAttendance.AttendanceDetail);
  //     let startFrom = new Date(toDate.getFullYear(), toDate.getMonth(), 1 );
  //     while (startFrom.getDate() <= toDate.getDate()) {
  //       let submitAttendanced = attendance.find(x => new Date(x.AttendanceDay).getDate() == startFrom.getDate());
  //       if (submitAttendanced != null) {
  //         this.attendanceData.push(submitAttendanced.TotalMinutes/60)
  //       } else {
  //         this.attendanceData.push(0);
  //       }
  //       startFrom.setDate( startFrom.getDate()+1);
  //     }
  //     this.isMonthlyRecordFound = true;
  //   }
  //   this.monthlyPerformaceChart();
  // }

  // bindYearlyPerformance(res: any) {
  //   this.monthlyWorkingHour = [];
  //   this.monthlyBurningHour =[];
  //   this.monthlyGapHour = [];
  //   if (res.YearlyAttendance && res.YearlyAttendance.length > 0) {
  //     for (let i = 0; i < res.YearlyAttendance.length; i++) {
  //       let days = this.daysInMonthExcludingWeekends(res.YearlyAttendance[i].ForYear, res.YearlyAttendance[i].ForMonth-1);
  //       this.monthlyWorkingHour.push(((days*480)/60));
  //       let attendance = JSON.parse(res.YearlyAttendance[i].AttendanceDetail);
  //       let burnedHour = attendance.map(x => x.TotalMinutes).reduce((acc, curr) => {return acc + curr;}, 0);
  //       this.monthlyBurningHour.push(burnedHour/60);
  //       this.monthlyGapHour.push(((days*480) - burnedHour)/60);
  //     }
  //   }
  //   this.yearlyPerformaceChart();
  // }

  // daysInMonthExcludingWeekends(year: number, month: number) {
  //   let date = new Date(year, month, 1);
  //   let days = 0;
  //   while (date.getMonth() === month) {
  //     if (date.getDay() !== 0 && date.getDay() !== 6) {
  //       days++;
  //     }
  //     date.setDate(date.getDate() + 1);
  //   }
  //   return days;
  // }

  // getAllocateCompany() {
  //   let data = this.local.findRecord("Companies");
  //   if (data) {
  //     this.allocatedClients = data.find(x => x.CompanyId == this.employeeDetails.CompanyId);
  //   }
  // }

  // getLastFourMonth() {
  //   for (let i = 0; i < 4; i++) {
  //     let date = new Date();
  //     date.setMonth(date.getMonth() - i);
  //     this.performanceMonthsYears.push({
  //       months: date.toLocaleString('default', {month: 'long'}),
  //       years: date.toLocaleString('default', {year: 'numeric'}),
  //       isActive: true
  //     });
  //   }
  // }

  // findNoOfDaysinMonth(month: number, year: number) {
  //   this.daysInMonth = [];
  //   let lastDate = new Date(year, month, 0).getDate();
  //   for (let i = 1; i <= lastDate; i++) {
  //     this.daysInMonth.push(i);
  //   }
  // }

  // monthlyPerformaceChart() {
  //   let elem: any = document.getElementById('monthlyPerformance');
  //   const ctx = elem.getContext('2d');
  //   const myChart = new Chart(ctx, {
  //     type: 'line',
  //     data: {
  //       labels:  this.daysInMonth,
  //       datasets: [{
  //         label: 'Monthly Performance',
  //         backgroundColor: 'rgb(255, 99, 132)',
  //         borderColor: 'rgb(255, 99, 132)',
  //         data: this.attendanceData,
  //     }]
  //     }
  //   })
  //   this.graphInstances.push(myChart);
  // };

  // yearlyPerformaceChart() {
  //   let elem: any = document.getElementById('yearlyPerformance');
  //   const ctx = elem.getContext('2d');
  //   const yearlyChart = new Chart(ctx, {
  //     type: 'line',
  //     data: {
  //       labels:  this.months,
  //       datasets: [{
  //         label: 'Working Hours',
  //         backgroundColor: '#7570b3',
  //         borderColor: '#7570b3',
  //         pointBackgroundColor: '#443f7c',
  //         pointHoverBorderColor: '#443f7c',
  //         pointBorderColor: '#443f7c',
  //         pointHoverBackgroundColor: '#443f7c',
  //         data: this.monthlyWorkingHour,
  //       },{
  //         label: 'Burning Hours',
  //         backgroundColor: '#66a61e',
  //         borderColor: '#66a61e',
  //         pointBackgroundColor: '#66a61e',
  //         pointHoverBorderColor: '#66a61e',
  //         pointBorderColor: '#66a61e',
  //         pointHoverBackgroundColor: '#66a61e',
  //         data: this.monthlyBurningHour,
  //       },
  //       {
  //         label: 'Gap',
  //         backgroundColor: '#d95f02',
  //         borderColor: '#d95f02',
  //         pointBackgroundColor: '#d95f02',
  //         pointHoverBorderColor: '#d95f02',
  //         pointBorderColor: '#d95f02',
  //         pointHoverBackgroundColor: '#d95f02',
  //         data: this.monthlyGapHour,
  //       }]
  //     }
  //   })
  // };

  // performanceMonth(index: number, item: any) {
  //   this.DestroyGraphInstances();
  //   this.isActive = false;
  //   this.currentPerformance = {
  //     month: this.performanceMonthsYears[index].months,
  //     year: this.performanceMonthsYears[index].years
  //   };
  //   var value = document.querySelectorAll("ul .payslip");
  //   for (let i=0; i <value.length; i++) {
  //     value[i].classList.remove('active');
  //   }
  //   value[index].classList.add('active');

  //   var d = Date.parse(item.months + `1, ${item.years}`);
  //   if(!isNaN(d)){
  //     let month = new Date(d).getMonth() + 1;
  //     this.findNoOfDaysinMonth(month, item.years);
  //     this.loadData(month, item.years);
  //   }
  // }

  // DestroyGraphInstances() {
  //   let i = 0;
  //   while(i < this.graphInstances.length) {
  //     this.graphInstances[i].destroy();
  //     i++;
  //   }
  //   this.graphInstances = [];
  // }
}

class Objective {
  Objective: string = null;
  ObjSeeType: boolean = false;
  IsIncludeReview: boolean = false;
  Tag: string = null;
  ProgressMeassureType: number = 1;
  StartValue: number = 0;
  TargetValue: number = 0;
  MetricUnits: number = 0;
  ProgressCalculatedAs: number = 0;
  TimeFrameStart: Date = new Date();
  TimeFrmaeEnd: Date = new Date();
}
