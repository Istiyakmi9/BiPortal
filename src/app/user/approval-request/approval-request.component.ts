import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'ng2-charts';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { GetEmployees } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, ToLocateDate, WarningToast } from 'src/providers/common-service/common.service';
import { ItemStatus } from 'src/providers/constants';
import { Filter, UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-approval-request',
  templateUrl: './approval-request.component.html',
  styleUrls: ['./approval-request.component.scss']
})
export class ApprovalRequestComponent implements OnInit {
  active: number = 1;
  leave_request: any = null;
  requestState: string = '';
  isLoading: boolean = false;
  currentRequest: any = null;
  currentTimesheet: Array<any> = [];
  employeeList: autoCompleteModal = null;
  editedMessage: string = '';
  itemStatus: number = 0;
  currentUser: any = null;
  isPageLoading: boolean = false;
  attendance: any = null;
  timesheet: any = null;
  attendanceDetail: Array<any> = [];
  timesheetDetail: Array<any> = [];
  leaveDeatil: Array<any> = [];
  requestModal: number = 0;
  attendanceUrl: string = null;
  currentYear: number = 0;
  monthsName: Array<any> = [];
  attendanceRquestPageIsReady: boolean = false;
  request: Filter = new Filter();
  attendanceRequestDetail: Array<any> = [];
  requestModalData: any = null;
  currentApprovalRequest: any = null;
  orderByAttendanceDateAsc: boolean = null;
  orderByRequestedOnAsc: boolean = null;
  applicationData: any = null;
  employeeId: number = 0;
  requestedOn: number = 0;
  missAttendanceStatus: number = 0;

  constructor(
    private http: AjaxService,
    private userService: UserService
    ) { }

  ngOnInit(): void {
    this.currentUser = this.userService.getInstance();
    this.employeeList = new autoCompleteModal();
    this.employeeList.data = [];
    this.employeeList.placeholder = "Employee List";
    this.employeeList.data.push({
      value: 0,
      text: "Default Employee"
    });
    this.employeeList.isMultiSelect = false;
    this.request.SortBy = null;
    this.request.PageIndex = 1;
    this.request.SearchString = "";
    this.loadAutoComplete();
    this.currentYear = new Date().getFullYear();
    for (let i = 0; i <= new Date().getMonth(); i++) {
      this.monthsName.push(new Date(this.currentYear, i, 1))
    }
    this.itemStatus = 2;
    this.loadData();
  }

  loadData() {
    this.isPageLoading = true;
    this.http.get(`AttendanceRequest/GetManagerRequestedData/${this.currentUser.UserId}/${this.itemStatus}`).then(response => {
      if(response.ResponseBody) {
        this.buildPage(response.ResponseBody);
        this.isPageLoading = false;
      } else {
        ErrorToast("Fail to fetch data. Please contact to admin.");
      }
    }).catch(e => {
      this.isPageLoading = false;
      ErrorToast("Fail to fetch data. Please contact to admin.");
    });
  }

  loadAutoComplete() {
    this.employeeList.data = [];
    this.employeeList.placeholder = "Employee";
    this.employeeList.data = GetEmployees();
    this.applicationData = GetEmployees();
    this.employeeList.className = "";
  }

  buildPage(req: any) {
    this.leave_request = [];

    if(req.ApprovalRequest) {
      this.leave_request = req.ApprovalRequest;
      this.filterLeave();
    }

    this.attendance = [];
    if (req.AttendaceTable) {
      this.attendance = req.AttendaceTable;
      this.filterAttendance();
    }

    this.timesheet = [];
    if (req.TimesheetTable) {
      this.timesheet = req.TimesheetTable;
      this.weekDistributed();
    }
  }

  reloadPage() {
    if (this.active != 4)
      this.loadData();
    else
      this.loadAttendanceRequestDetail();
  }

  openLeaveModal(state: string, request: any) {
    $('#leaveModal').modal('show');
    this.requestState = state;
    this.requestModal = 1; // leave
    this.currentRequest = request;
    this.currentRequest["EmployeeName"] = request.FirstName + " " + request.LastName;
  }

  openTimesheetModal(state: string, request: any) {
    $('#timesheetModal').modal('show');
    this.requestState = state;
    this.currentTimesheet = request;
  }

  openAttendacneModal(state: string, request: any) {
    $('#leaveModal').modal('show');
    this.requestState = state;
    this.requestModal = 3; // attendance
    this.currentRequest = request;
    this.currentRequest.RequestStatusId = request.PresentDayStatus;
    this.currentRequest["EmployeeName"] = request.EmployeeName;
  }

  buildAttendanceActionUrl() {
    switch(this.requestState) {
      case 'Approved':
        this.currentRequest.RequestStatusId = ItemStatus.Approved;
        this.attendanceUrl = 'AttendanceRequest/ApprovalAction';
        break;
      case 'Rejected':
        this.currentRequest.RequestStatusId = ItemStatus.Rejected;
        this.attendanceUrl = 'AttendanceRequest/RejectAction';
        break;
      case 'Othermember':
        this.attendanceUrl = 'AttendanceRequest/ReAssigneToOtherManager';
        break;
    }
  }

  submitRequest() {
    switch(this.requestModal) {
      case 1: // leave
        this.submitActionForLeave();
      break;
      case 3: // attendance
      this.requestState
        this.submitActionForAttendance();
      break;
    }
  }

  changeTab() {
    this.itemStatus = ItemStatus.Pending;
    switch (this.active) {
      case 1:
        this.filterAttendance();
        break;
      case 2:
        this.weekDistributed();
        break;
      case 3:
        this.filterLeave();
        break;
    }
  }

  filterRequest(e: any) {
    this.itemStatus = Number(e.target.value);
    // switch (this.active) {
    //   case 1:
    //     this.filterAttendance();
    //     break;
    //   case 2:
    //     this.weekDistributed();
    //     break;
    //   case 3:
    //     this.filterLeave();
    //     break;
    // }

    this.loadData();
  }

  filterAttendance() {
    this.attendanceDetail = [];
    if(this.attendance && this.attendance.length > 0) {
      this.attendance.map(item => {
        let detail:Array<any> = JSON.parse(item.AttendanceDetail);
        if(detail && detail.length > 0) {
          if (this.itemStatus > 0 && this.itemStatus <4)
            detail = detail.filter(x => x.PresentDayStatus === this.itemStatus);
          else
            detail = detail.filter(x => x.PresentDayStatus === ItemStatus.Approved || x.PresentDayStatus === ItemStatus.Pending || x.PresentDayStatus === ItemStatus.Rejected);
          if(detail.length > 0) {
            for (let i = 0; i < detail.length; i++) {
              detail[i].AttendanceDay = new Date(detail[i].AttendanceDay);
              if(detail[i].AttendanceDay.getDay() === 0 || detail[i].AttendanceDay.getDay() === 6) {
                detail.splice(i, 1);
              } else {
                detail[i].AttendanceId = item.AttendanceId;
              }
            }
            this.attendanceDetail.push(...detail);
          }
        }
      });
    }
  }

  filterLeave() {
    this.leaveDeatil = [];
    if (this.leave_request && this.leave_request.length > 0) {
      let detail = [];
      if (this.itemStatus > 0 && this.itemStatus <4)
        detail = this.leave_request.filter(x => x.RequestStatusId === this.itemStatus);
      else
        detail = this.leave_request.filter(x => x.RequestStatusId === ItemStatus.Approved || x.RequestStatusId === ItemStatus.Pending || x.RequestStatusId === ItemStatus.Rejected);
      if (detail && detail.length > 0)
        this.leaveDeatil = detail;
    }
  }

  weekDistributed() {
    this.timesheetDetail = [];
    if(this.timesheet && this.timesheet.length > 0) {
      this.timesheet.map(item => {
        let detail:Array<any> = JSON.parse(item.TimesheetWeeklyJson);
        let index = 0;
        while (index <detail.length) {
          let increment = index + 7;
          let data = detail.slice(index, increment);
          data = data.filter(x => new Date(x.PresentDate).getMonth() == new Date().getMonth());
          if (this.itemStatus > 0 && this.itemStatus < 4)
            data = data.filter(x => x.TimesheetStatus === this.itemStatus);
          else
            data = data.filter(x => x.TimesheetStatus === ItemStatus.Approved || x.TimesheetStatus === ItemStatus.Pending || x.TimesheetStatus === ItemStatus.Rejected);
          if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              data[i].TimesheetId = item.TimesheetId;
            }
            this.timesheetDetail.push(data);
          }
          //let totalTimeBurned = data.map(x => x.TotalMinutes).reduce((acc, curr) => {return acc + curr;}, 0);
          index=(index+7);
        }
      });

    }
  }

  getStatusId() {
    let statusId: number = 0;
    switch(this.requestState) {
      case 'Approved':
        statusId = ItemStatus.Approved;
        break;
      case 'Rejected':
        statusId = ItemStatus.Rejected;
        break;
      case 'Othermember':
        statusId = ItemStatus.ReAssigned
        break;
    }
    return statusId;
  }

  submitTimesheetRequest() {
    this.isLoading = true;
    let endPoint = '';

    switch(this.requestState) {
      case 'Approved':
        endPoint = 'TimesheetRequest/ApproveTimesheet';
        break;
      case 'Rejected':
        endPoint = 'TimesheetRequest/RejectAction';
        break;
      case 'Othermember':
        endPoint = 'TimesheetRequest/ReAssigneToOtherManager';
        break;
    }

    this.http.put(endPoint, this.currentTimesheet).then((response:ResponseModel) => {
      if (response.ResponseBody) {
        this.buildPage(response.ResponseBody);
        $('#timesheetModal').modal('hide');
        Toast("Submitted Successfully");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  submitActionForLeave() {
    this.isLoading = true;
    let endPoint = '';

    switch(this.requestState) {
      case 'Approved':
        endPoint = 'LeaveRequest/ApprovalAction';
        break;
      case 'Rejected':
        endPoint = 'LeaveRequest/RejectAction';
        break;
      case 'Othermember':
        endPoint = 'LeaveRequest/ReAssigneToOtherManager';
        break;
      default:
        throw 'Invalid option selected.';
        break;
    }
    let currentResponse = {
      LeaveFromDay: this.currentRequest.FromDate,
      LeaveToDay: this.currentRequest.ToDate,
      EmployeeId: this.currentRequest.EmployeeId,
      LeaveRequestNotificationId : this.currentRequest.LeaveRequestNotificationId,
    }
    this.http.put(endPoint, currentResponse).then((response:ResponseModel) => {
      if (response.ResponseBody) {
        this.buildPage(response.ResponseBody);
        $('#leaveModal').modal('hide');
        this.isLoading = false;
        Toast("Submitted Successfully");
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  submitActionForAttendance() {
    this.isLoading = true;
    if (this.attendance) {
      this.buildAttendanceActionUrl()
      this.http.put(this.attendanceUrl,this.currentRequest).then((response:ResponseModel) => {
        if(response.ResponseBody) {
          this.buildPage(response.ResponseBody);
          this.isPageLoading = false;
        } else {
          ErrorToast("Fail to fetch data. Please contact to admin.");
        }
        this.isLoading = false;
        $('#leaveModal').modal('hide');
      }).catch(e => {
        this.isLoading = false;
      })
    } else {
      ErrorToast("Attendance detail not found. Please contact to admin.");
    }
  }

  onYearChange(e: any) {
    let value = Number(e.target.value);
    if (value) {
      this.monthsName = [];
      if (value == new Date().getFullYear()) {
        for (let i = 0; i <= new Date().getMonth(); i++) {
          this.monthsName.push(new Date(value, i, 1))
        }
      } else {
        for (let i = 0; i <= 11; i++) {
          this.monthsName.push(new Date(value, i, 1))
        }
      }
    }
  }

  loadAttendanceRequestDetail() {
    this.attendanceRquestPageIsReady = false;
    this.request.PageSize = 10;

    this.http.post("Attendance/GetMissingAttendanceApprovalRequest", this.request).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        this.bindAttendanceRequestDetail(response.ResponseBody);
        Toast("Attendance request loaded successfully.");
        this.isLoading = false;
      }

      this.attendanceRquestPageIsReady = true;
    });
  }

  UpdateAttendanceStatus() {
    this.isLoading = true;
    let request = {
      ComplaintOrRequestId: this.currentApprovalRequest.ComplaintOrRequestId,
      ManagerId: this.currentApprovalRequest.ManagerId,
      RequestedId: this.currentApprovalRequest.RequestedId,
      EmployeeMessage: this.currentApprovalRequest.EmployeeMessage,
      AttendanceDate: this.currentApprovalRequest.AttendanceDate,
      NotifyList: this.currentApprovalRequest.NotifyList,
      EmployeeId: this.currentApprovalRequest.EmployeeId,
      IsFullDay: true
    };

    this.attendanceRquestPageIsReady = false;
    let requestBody = [request];

    this.http.put(this.requestModalData.ApiUrl, requestBody).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        this.bindAttendanceRequestDetail(response.ResponseBody);
        Toast(`Attendance ${this.requestModalData.Status} successfully.`);
        this.isLoading = false;
      }

      this.isLoading = false;
      this.attendanceRquestPageIsReady = true;
      $('#approval-attendance').modal('hide');
    }).catch(e => {
      this.isLoading = false;
      this.attendanceRquestPageIsReady = true;
      $('#approval-attendance').modal('hide');
    });
  }

  bindAttendanceRequestDetail(response: any) {
    this.attendanceRequestDetail = response;
    if (this.attendanceRequestDetail.length > 0) {
      this.request.TotalRecords = this.attendanceRequestDetail[0].Total;
    } else
      this.request.TotalRecords = 0;
  }

  ApproveRequest() {
    this.UpdateAttendanceStatus();
  }

  RejectRequest() {
    this.UpdateAttendanceStatus();
  }

  showApproveRequestModal(e: any) {
    this.requestModalData = {
      Title: "Approve request",
      IsApprove: true,
      IsReject: false,
      Status: "Approved",
      ApiUrl: "Attendance/ApproveRaisedAttendanceRequest"
    };

    this.currentApprovalRequest = e;
    $('#approval-attendance').modal('show');
  }

  showRejectRequestModal(e: any) {
    this.requestModalData = {
      Title: "Reject request",
      IsApprove: false,
      IsReject: true,
      Status: "Rejected",
      ApiUrl: "Attendance/RejectRaisedAttendanceRequest"
    };

    this.currentApprovalRequest = e;
    $('#approval-attendance').modal('show');
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'Asc';
    } else {
      Order = 'Desc';
    }
    if (FieldName == 'AttendanceDate') {
      this.orderByAttendanceDateAsc = !flag;
      this.orderByRequestedOnAsc = null;
    }else if (FieldName == 'RequestedOn') {
      this.orderByAttendanceDateAsc = null;
      this.orderByRequestedOnAsc = !flag;
    }
    this.request.SortBy = FieldName +" "+ Order;
    this.loadAttendanceRequestDetail()
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.request = e;
      this.loadAttendanceRequestDetail();
    }
  }

  onEmloyeeChanged(e: any) {
    this.request.EmployeeId = this.employeeId;
    this.loadAttendanceRequestDetail();
  }

  filter(e: any, type: string) {
    let value = Number(e.target.value);
    if (value > 0) {
      if (type == 'requestedon') {
        let startdate = new Date();
        let enddate = new Date();
        enddate.setDate(enddate.getDate()- value);
        this.request.SearchString = `1=1 and RequestedOn between '${enddate.getFullYear()}-${enddate.getMonth()+1}-${enddate.getDate()}' and '${startdate.getFullYear()}-${startdate.getMonth()+1}-${startdate.getDate()}'`;
      } else if (type == 'status') {
        this.request.SearchString = `1=1 and RequestTypeId = ${4} and ManagerId = ${this.currentUser.UserId} and CurrentStatus = ${value}`;
      }
      this.loadAttendanceRequestDetail();
    }
  }

  resetFilter() {
    this.employeeId =0;
    this.missAttendanceStatus = 0;
    this.requestedOn = 0;
    this.request.SearchString = "";
    this.loadAttendanceRequestDetail();
  }
}

export class ApprovalRequest {
  LeaveRequestNotificationId: number = null;
  AttendanceId: number = 0;
	UserName:string = '';
  EmployeeName: string = '';
	Message:string = '';
	UserId:number = null;
	UserTypeId: number = null;
	RequestedOn:Date = null;
	Email:string  = '';
	Mobile:string = '';
	FromDate:Date = null;
	ToDate:Date = null;
	AssigneeId:number = null;
	ProjectId:number = null;
	ProjectName:string = '';
  RequestStatusId: number = 0;
  RequestType: string = "";
}
