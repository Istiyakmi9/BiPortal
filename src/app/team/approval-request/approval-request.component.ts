import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { EmployeeFilterHttpService } from 'src/providers/AjaxServices/employee-filter-http.service';
import { ApplicationStorage, GetEmployees } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { ItemStatus, UserType } from 'src/providers/constants';
import { Filter, UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-approval-request',
  templateUrl: './approval-request.component.html',
  styleUrls: ['./approval-request.component.scss']
})
export class ApprovalRequestComponent implements OnInit, AfterViewChecked {
  active = 1;
  requestState: string = '';
  isLoading: boolean = false;
  currentRequest: any = null;
  editedMessage: string = '';
  itemStatus: number = 0;
  currentUser: any = null;
  isPageLoading: boolean = false;
  attendanceDetail: Array<any> = [];
  requestModal: number = 0;
  attendanceController: string = "AttendanceRequest";
  leaveController: string = "LeaveRequest";
  timesheetController: string = "TimesheetRequest";
  requestUrl: string = null;
  timesheetDetail: Array<any> = [];
  currentTimesheet: any = null;
  filterText: string = "Assigned to me";
  filterId: number = 0;
  attendanceRquestPageIsReady: boolean = false;
  requestFilter: Filter = new Filter();
  attendanceRequestDetail: Array<any> = [];
  currentApprovalRequest: any = null;
  requestModalData: any = null;
  viewer: any = null;
  basePath: string = "";
  leaveAttachment: Array<any> = [];
  employeeId: number = 0;
  employeeList: autoCompleteModal = null;
  applicationData: any = null;
  orderByAttendanceDateAsc: boolean = null;
  orderByRequestedOnAsc: boolean = null;
  requestedOn: number = 0;
  missAttendanceStatus: number = 0;
  isAdmin: boolean = false;
  leaveRequestDetail: Array<any> = [];
  attendanceData: Filter = new Filter();
  attendanceRecord: Attendance;
  leaveData: Filter = new Filter();
  leaveRecord: Leave;
  timesheetRecord: Timesheet;
  timesheetData: Filter = new Filter();
  monthDays: Array<number> = [];
  scrollDiv: any = null;
  excelTable: any = null;
  attendance: Attendance;
  attendanceReviewData: Filter = new Filter();
  selectedAttendance: any = null;
  filterYears: Array<number> = [];
  selectedAttendanceRequest: Array<any> = [];
  activePageNumber: number = 1;

  constructor(private http: CoreHttpService,
              private local: ApplicationStorage,
              private userService: UserService) { }

    ngAfterViewChecked(): void {
    if (this.scrollDiv == null) {
      this.scrollDiv = document.getElementById("scroll-dv");
    }
    if (this.scrollDiv != null) {
      this.initHandler();
    }
  }

  initHandler() {
    this.scrollDiv.addEventListener('scroll', function (e) {
      var elem = document.getElementById("excel-table");
      var innerElem = document.getElementById("inner-scroller");
      var left = ((elem.clientWidth) / (innerElem.clientWidth)) * e.currentTarget.scrollLeft;
      if (e.currentTarget.scrollLeft > 0)
        elem.scrollLeft = left;
      else {
        elem.scrollLeft = left;
      }
      // console.log('Excel: ' + left + ', Inner: ' + e.currentTarget.scrollLeft);
    });
  }

  ngOnInit(): void {
    this.requestUrl = `${this.attendanceController}/GetManagerRequestedData`;
    this.currentUser = this.userService.getInstance();
    this.employeeList = new autoCompleteModal();
    this.employeeList.data = [];
    this.employeeList.placeholder = "Employee List";
    this.employeeList.data.push({
      value: 0,
      text: "Default Employee"
    });
    this.employeeList.isMultiSelect = false;
    this.basePath = this.http.GetImageBasePath();
    this.requestFilter.SortBy = null;
    this.requestFilter.PageIndex = 1;
    this.requestFilter.SearchString = "";
    if (this.currentUser.RoleId == UserType.Admin)
      this.isAdmin = true;
    else
      this.isAdmin = false;

    this.loadAutoComplete();
    let date = new Date();
    let currentYear = date.getFullYear();
    for (let i = 0; i < 3; i++) {
      this.filterYears.push(currentYear - i);
    }
    this.attendance = {
      EmployeeName: "",
      ForMonth: date.getMonth() + 1,
      ForYear: date.getFullYear()
    }
    this.itemStatus = 2;
    this.attendanceRecord = {
      EmployeeId: 0,
      ForMonth: date.getMonth() + 1,
      ForYear: date.getFullYear(),
      PageIndex: 1,
      ReportingManagerId: this.currentUser.UserId,
      PresentDayStatus: ItemStatus.Submitted,
      TotalDays: 0
    };
    this.leaveRecord = {
      EmployeeId: 0,
      FromDate: date,
      ToDate: date,
      ReportingManagerId: this.currentUser.UserId,
      RequestStatusId: 2,
      PageIndex: 1
    }
    this.timesheetRecord = {
      EmployeeId: 0,
      ReportingManagerId: this.currentUser.UserId,
      ForYear: date.getFullYear(),
      TimesheetStatus: 8,
      PageIndex: 1,
      Days: 0
    }
    let days = new Date(this.attendance.ForYear, this.attendance.ForMonth, 0).getDate();
    for (let i = 1; i <= days; i++) {
      this.monthDays.push(i);
    }
    this.attendanceReviewData.ForMonth = this.attendance.ForMonth + 1;
    this.attendanceReviewData.ForYear = this.attendance.ForYear ;
    this.attendanceReviewData.SearchString = ` 1=1 `;
    this.activePageNumber = 1;
    this.getAttendanceRequest();
  }

  updatePage(index: number) {
    if (index == 1) {
      this.requestUrl = `${this.attendanceController}/GetManagerRequestedData`;
      this.filterText = "Assigned to me";
    } else {
      this.requestUrl = `${this.attendanceController}/GetAllRequestedData`;
      this.filterText = "All request(s)";
    }
  }

  openLeaveModal(state: string, request: any) {
    this.requestState = state;
    this.requestModal = 1; // leave
    this.currentRequest = request;
    this.currentRequest["EmployeeName"] = request.FirstName + " " + request.LastName;
    $('#leaveModal').modal('show');
  }

  openTimesheetModal(state: string, request: any) {
    this.requestState = state;
    this.currentTimesheet = request;
    $('#timesheetModal').modal('show');
  }

  openAttendacneModal(state: string) {
    this.requestState = state;
    this.requestModal = 3; // attendance
    if (this.selectedAttendanceRequest.length > 0) {
      $('#leaveModal').modal('show');
    }
    // this.currentRequest = request;
    // this.currentRequest.RequestStatusId = request.AttendanceStatus;
    // this.currentRequest.PresentDayStatus = request.AttendanceStatus;
    // this.currentRequest["EmployeeName"] = request.EmployeeName;
    // this.currentRequest["Email"] = request.Email;
    // this.currentRequest["Mobile"] = request.Mobile;
  }

  submitRequest() {
    switch (this.requestModal) {
      case 1: // leave
        this.submitActionForLeave();
        break;
      case 3: // attendance
        this.submitActionForAttendance();
        break;
    }
  }

  getFilterType() {
    this.filterId = 0;
    switch (this.filterText) {
      case 'Assigned to me':
        this.filterId = 1;
        break;
    }
  }

  submitActionForLeave() {
    this.isLoading = true;
    let endPoint = '';

    switch (this.requestState) {
      case 'Approved':
        endPoint = `${this.leaveController}/ApproveLeaveRequest`;
        break;
      case 'Rejected':
        endPoint = `${this.leaveController}/RejectLeaveRequest`;
        break;
      case 'Othermember':
        endPoint = `${this.leaveController}/ReAssigneLeaveRequest`;
        break;
    }

    let currentResponse = {
      LeaveFromDay: this.currentRequest.FromDate,
      LeaveToDay: this.currentRequest.ToDate,
      EmployeeId: this.currentRequest.EmployeeId,
      LeaveRequestNotificationId: this.currentRequest.LeaveRequestNotificationId,
      RecordId: this.currentRequest.RecordId,
      LeaveTypeId: this.currentRequest.LeaveTypeId,
      RequestStatusId: this.leaveRecord.RequestStatusId
    }

    this.http.put(`${endPoint}/${this.filterId}`, currentResponse).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        this.leaveRequestDetail = response.ResponseBody;
        if (this.leaveRequestDetail.length > 0)
          this.leaveData.TotalRecords = this.leaveRequestDetail[0].Total;
        else
          this.leaveData.TotalRecords = 0;

        if (this.requestState == "Approved")
          Toast("Leave approved successfully");
        else
          Toast("Attendance rejected successfully");

        $('#leaveModal').modal('hide');
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  submitTimesheetRequest() {
    this.isLoading = true;
    let endPoint = '';

    switch (this.requestState) {
      case 'Approved':
        endPoint = `${this.timesheetController}/ApproveTimesheetRequest`;
        break;
      case 'Rejected':
        endPoint = `${this.timesheetController}/RejectTimesheetRequest`;
        break;
      case 'Othermember':
        endPoint = `${this.timesheetController}/ReAssigneTimesheetRequest`;
        break;
      case 'Reopen':
        endPoint = `${this.timesheetController}/ReOpenTimesheetRequest`;
        break;
    }

    this.http.put(`${endPoint}/${this.currentTimesheet.TimesheetId}/${this.filterId}`, this.timesheetRecord).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        this.timesheetDetail = response.ResponseBody;
        if (this.timesheetDetail && this.timesheetDetail.length > 0) {
          this.timesheetData.TotalRecords = this.timesheetDetail[0].Total;
        } else {
          this.timesheetData.TotalRecords = 0;
        }
        $('#timesheetModal').modal('hide');
        Toast("Submitted Successfully");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  submitActionForAttendance() {
    this.isLoading = true;
    if (this.selectedAttendanceRequest.length > 0) {
      let endPoint = "";
      switch (this.requestState) {
        case 'Approved':
          endPoint = `${this.attendanceController}/ApproveAttendanceRequest`;
          break;
        case 'Rejected':
          endPoint = `${this.attendanceController}/RejectAttendanceRequest`;
          break;
        case 'Othermember':
          endPoint = `${this.attendanceController}/ReAssigneAttendanceRequest`;
          break;
      }

      this.selectedAttendanceRequest.forEach(x => {
        x.PageIndex = this.attendanceRecord.PageIndex;
        x.EmployeeId = this.attendanceRecord.EmployeeId;
        x.PresentDayStatus = this.attendanceRecord.PresentDayStatus;
        x.TotalDays = this.attendanceRecord.TotalDays;
      });

      this.http.put(`${endPoint}/${this.attendanceRecord.PresentDayStatus}`, this.selectedAttendanceRequest).then((response: ResponseModel) => {
        if (response.ResponseBody) {
          this.attendanceDetail = response.ResponseBody.FilteredAttendance;
          if (this.attendanceDetail.length > 0)
            this.attendanceData.TotalRecords = this.attendanceDetail[0].Total;
          else
            this.attendanceData.TotalRecords = 0;
          this.employeeList.data = response.ResponseBody.AutoCompleteEmployees;
          this.applicationData = response.ResponseBody.AutoCompleteEmployees;
          (document.querySelector('input[data-name="selectall-checkbox"]')as HTMLInputElement).checked = false;

          if (this.requestState == "Approved")
            Toast("Attendance approved successfully");
          else
            Toast("Attendance rejected successfully");

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
      ErrorToast("Please select attendance first");
    }
  }

  loadAttendanceRequestDetail() {
    this.attendanceRquestPageIsReady = false;
    this.requestFilter.PageSize = 10;
    if (this.requestFilter.SearchString == "1=1")
      this.requestFilter.SearchString = "";

    this.http.post("Attendance/GetMissingAttendanceApprovalRequest", this.requestFilter).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        this.bindAttendanceRequestDetail(response.ResponseBody);
        Toast("Attendance request loaded successfully.");
        this.isLoading = false;
      }

      this.attendanceRquestPageIsReady = true;
    });
  }

  bindAttendanceRequestDetail(response: any) {
    this.attendanceRequestDetail = response;
    if (this.attendanceRequestDetail.length > 0) {
      this.requestFilter.TotalRecords = this.attendanceRequestDetail[0].Total;
      this.attendanceRequestDetail.map(x => x.AttendanceDate = new Date(x.AttendanceDate));
    } else
      this.requestFilter.TotalRecords = 0;
  }

  ApproveRequest() {
    this.UpdateAttendanceStatus();
  }

  RejectRequest() {
    this.UpdateAttendanceStatus();
  }

  UpdateAttendanceStatus() {
    this.isLoading = true;
    let request = {
      ComplaintOrRequestId: this.currentApprovalRequest.ComplaintOrRequestId,
      TargetId: this.currentApprovalRequest.TargetId,
      TargetOffset: this.currentApprovalRequest.TargetOffset,
      EmployeeMessage: this.currentApprovalRequest.EmployeeMessage,
      NotifyList: this.currentApprovalRequest.NotifyList,
      EmployeeId: this.currentApprovalRequest.EmployeeId
    };

    this.attendanceRquestPageIsReady = false;
    let requestBody = [request];

    this.http.put(this.requestModalData.ApiUrl, requestBody).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        Toast(`Attendance ${this.requestModalData.Status} successfully.`);
        let empid = this.local.getByKey('EmployeeId');
        if (empid > 0) {
          this.requestFilter.EmployeeId = empid;
          this.loadAttendanceRequestDetail();
        } else
          this.bindAttendanceRequestDetail(response.ResponseBody);
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

  closePdfViewer() {
    event.stopPropagation();
    this.viewer.classList.add('d-none');
    this.viewer.querySelector('iframe').setAttribute('src', '');
  }

  viewLeaveAttachmentModal(item: any) {
    if (item) {
      this.isLoading = true;
      this.http.post("Leave/GetLeaveAttachByManger", item).then(res => {
        if (res.ResponseBody) {
          this.leaveAttachment = res.ResponseBody.Table;
          $("#managerleaveFileModal").modal('show');
          this.isLoading = false;
        } else {
          this.isLoading = false;
          WarningToast("No record found");
        }
      }).catch(e => {
        this.isLoading = false;
        WarningToast("No record found");
      })
    }
  }

  viewFile(userFile: any) {
    userFile.FileName = userFile.FileName.replace(/\.[^/.]+$/, "");
    let fileLocation = `${this.basePath}${userFile.FilePath}/${userFile.FileName}.${userFile.FileExtension}`;
    this.viewer = document.getElementById("managerleave-container");
    this.viewer.classList.remove('d-none');
    this.viewer.querySelector('iframe').setAttribute('src', fileLocation);
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if (flag || flag == null) {
      Order = 'Asc';
    } else {
      Order = 'Desc';
    }
    if (FieldName == 'AttendanceDate') {
      this.orderByAttendanceDateAsc = !flag;
      this.orderByRequestedOnAsc = null;
    } else if (FieldName == 'RequestedOn') {
      this.orderByAttendanceDateAsc = null;
      this.orderByRequestedOnAsc = !flag;
    }
    this.requestFilter.SortBy = FieldName + " " + Order;
    this.loadAttendanceRequestDetail()
  }

  GetFilterResult(e: Filter) {
    if (e != null) {
      this.requestFilter = e;
      this.loadAttendanceRequestDetail();
    }
  }

  onEmloyeeChanged(e: any) {
    this.requestFilter.EmployeeId = this.employeeId;
    this.local.setByKey('EmployeeId', this.employeeId)
    this.loadAttendanceRequestDetail();
  }

  filter(e: any, type: string) {
    let value = Number(e.target.value);
    if (value > 0) {
      if (type == 'requestedon') {
        let startdate = new Date();
        let enddate = new Date();
        enddate.setDate(enddate.getDate() - value);
        this.requestFilter.SearchString = `1=1 and RequestedOn between "${enddate.getFullYear()}-${enddate.getMonth() + 1}-${enddate.getDate()} 00:00:00" and "${startdate.getFullYear()}-${startdate.getMonth() + 1}-${startdate.getDate()} 23:59:59"`;
      } else if (type == 'status') {
        this.requestFilter.SearchString = `1=1 and RequestTypeId = ${4} and ManagerId = ${this.currentUser.UserId} and CurrentStatus = ${value}`;
      }
      this.loadAttendanceRequestDetail();
    }
  }

  loadAutoComplete() {
    this.employeeList.data = [];
    this.employeeList.placeholder = "Employee";
    this.employeeList.className = "";
  }

  getLeaveRequest() {
    this.isPageLoading = true;
    this.http.post("LeaveRequest/GetLeaveRequestNotification", this.leaveRecord).then(response => {
      if (response.ResponseBody) {
        this.leaveRequestDetail = response.ResponseBody;
        if (this.leaveRequestDetail && this.leaveRequestDetail.length > 0) {
          let today = new Date().toDateString();
          this.leaveRequestDetail.forEach(x => {
            if (new Date(x.FromDate).toDateString() < today)
              x.IsDatePassed = true;
            else
              x.IsDatePassed = false;

            if (x.ReporterDetail) {
              let data = JSON.parse(x.ReporterDetail);
              let approverDetail = data.filter(i => i.Status == ItemStatus.Approved || i.Status == ItemStatus.Rejected);
              if (approverDetail && approverDetail.length > 0)
                x.ReporterDetail = approverDetail;
              else
                x.ReporterDetail = [];
            }
          })
        }
        if (this.leaveRequestDetail && this.leaveRequestDetail.length > 0)
          this.leaveData.TotalRecords = this.leaveRequestDetail[0].Total;
        else
          this.leaveData.TotalRecords = 0;
        this.isPageLoading = false;
        Toast("Leave record found");
      } else {
        this.isPageLoading = false;
      }
    }).catch(e => {
      this.isPageLoading = false;
      ErrorToast("Fail to fetch data. Please contact to admin.");
    });
  }

  GeLeaveFilterResult(e: Filter) {
    if (e != null) {
      this.attendanceRecord.PageIndex = e.ActivePageNumber;
      this.getLeaveRequest();
    }
  }

  resetLeaveRequest() {
    this.leaveRecord.EmployeeId = 0;
    this.leaveRecord.RequestStatusId = 2;
    this.leaveRecord.PageIndex = 1
    this.leaveData = new Filter();
    this.getLeaveRequest();
  }

  getAttendanceRequest() {
    this.isPageLoading = true;
    this.attendanceDetail = []
    this.attendanceData = new Filter();
    this.http.post("AttendanceRequest/GetAttendenceRequestData", this.attendanceRecord).then(response => {
      if (response.ResponseBody) {
        this.attendanceDetail = response.ResponseBody.FilteredAttendance;
        if (this.attendanceDetail && this.attendanceDetail.length > 0) {
          this.attendanceData.TotalRecords = this.attendanceDetail[0].Total;
          this.attendanceData.ActivePageNumber = this.activePageNumber;
        } else {
          this.attendanceData.TotalRecords = 0;
        }
        this.employeeList.data = response.ResponseBody.AutoCompleteEmployees;
        this.applicationData = response.ResponseBody.AutoCompleteEmployees;
        Toast("Attendance record found");
        this.isPageLoading = false;
      } else {
        this.isPageLoading = false;
      }
    }).catch(e => {
      this.isPageLoading = false;
      ErrorToast("Fail to fetch data. Please contact to admin.");
    });
  }

  GetAttendanceFilterResult(e: Filter) {
    if (e != null) {
      this.activePageNumber = e.ActivePageNumber;
      this.attendanceRecord.PageIndex = e.ActivePageNumber;
      this.getAttendanceRequest();
    }
  }

  resetAttendanceRequest() {
    this.attendanceRecord.PageIndex = 1;
    this.attendanceRecord.EmployeeId = 0;
    this.attendanceRecord.PresentDayStatus = ItemStatus.Submitted;
    this.attendanceRecord.TotalDays = 0;
    this.attendanceData = new Filter();
    this.activePageNumber = 1;
    this.getAttendanceRequest();
  }

  reviewAttendanceLoad() {
    this.employeeList.data = GetEmployees();
    this.employeeId = 0;
  }

  onEmloyeeChange(event: any) {
    if (this.employeeId > 0) {
      this.attendanceReviewData.reset();
      this.attendanceReviewData.ForMonth = this.attendance.ForMonth;
      this.attendanceReviewData.ForYear = this.attendance.ForYear;
      this.attendanceReviewData.SearchString = `1=1 and EmployeeId = ${this.employeeId}`;
      this.attendanceReviewData.EmployeeId = this.employeeId;

      this.getReviewAttendanceDetail();
    }
  }

  getTimesheetRequest() {
    this.isPageLoading = true;
    this.http.post("TimesheetRequest/GetTimesheetRequestData", this.timesheetRecord).then(response => {
      if (response.ResponseBody) {
        this.timesheetDetail = response.ResponseBody;
        if (this.timesheetDetail && this.timesheetDetail.length > 0) {
          this.timesheetData.TotalRecords = this.timesheetDetail[0].Total;
        } else {
          this.timesheetData.TotalRecords = 0;
        }
        Toast("Timesheet record found");
        this.isPageLoading = false;
      } else {
        this.isPageLoading = false;
      }
    }).catch(e => {
      this.isPageLoading = false;
      ErrorToast("Fail to fetch data. Please contact to admin.");
    });
  }

  GetTimesheetFilterResult(e: Filter) {
    if (e != null) {
      this.timesheetRecord.PageIndex = e.ActivePageNumber;
      this.getTimesheetRequest();
    }
  }

  resetTimesheetRequest() {
    this.timesheetRecord.TimesheetStatus = 8;
    this.timesheetRecord.EmployeeId = 0;
    this.timesheetRecord.PageIndex = 1;
    this.timesheetData = new Filter();
    this.getTimesheetRequest();
  }

  filterByDateTimesheet(e: any) {
    let value = Number(e.target.value);
    let today = new Date();
    if (value > 0) {
      if (value == 7) {
        this.timesheetRecord.TimesheetStartDate = new Date(today.setDate(today.getDate() - 7));
        this.timesheetRecord.TimesheetEndDate = new Date();
      } else if (value == 14) {
        this.timesheetRecord.TimesheetStartDate = new Date(today.setDate(today.getDate() - 14));
        this.timesheetRecord.TimesheetEndDate = new Date();
      } else {
        this.timesheetRecord.TimesheetStartDate = new Date(today.setDate(today.getDate() - 30));
        this.timesheetRecord.TimesheetEndDate = new Date();
      }
      this.getTimesheetRequest();
    }
  }

  resetRequest() {
    switch (this.active) {
      case 1:
        this.resetAttendanceRequest();
        break;
      case 2:
        this.resetTimesheetRequest();
        break;
      case 3:
        this.resetLeaveRequest();
        break;
      case 4:
        this.resetFilter();
        break;
      case 5:
        this.resetAttedanceReviewFilter();
        break;
    }
  }

  resetFilter() {
    this.employeeId = 0;
    this.missAttendanceStatus = 0;
    this.requestedOn = 0;
    this.requestFilter.SearchString = "";
    this.loadAttendanceRequestDetail();
  }

  getReviewAttendanceDetail() {
    this.isPageLoading = true;
    this.attendanceDetail = [];
    this.attendanceReviewData.PageSize = 31;
    this.http.post("Attendance/getAttendancePage", this.attendanceReviewData).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        this.attendanceDetail = [];
        let attendanceDictionary = res.ResponseBody;
        let keys = Object.keys(attendanceDictionary);
        let total = 0;
        keys.forEach(x => {
          this.attendanceDetail.push({
            EmployeeId: Number(x),
            EmployeeName: attendanceDictionary[x][0].EmployeeName,
            AttendanceDetail: attendanceDictionary[x],
            total: attendanceDictionary[x][0].Total
          });
        })
        this.attendanceReviewData.TotalRecords = total;
        this.isPageLoading = false;
        Toast("Attendance detail loaded");
      }
    }).catch(e => {
      this.isPageLoading = false;
    })
  }

  filterAttedanceReviewRecords() {
    let delimiter = "";
    let searchString = "";
    this.attendanceReviewData.SearchString = ""
    this.attendanceReviewData.reset();
    this.monthDays = [];
    let days = new Date(this.attendance.ForYear, this.attendance.ForMonth, 0).getDate();
    for (let i = 1; i <= days; i++) {
      this.monthDays.push(i);
    }
    if (this.attendance.EmployeeName !== null && this.attendance.EmployeeName !== "") {
      searchString += ` EmployeeName like '%${this.attendance.EmployeeName.toUpperCase()}%'`;
      delimiter = "and";
    }

    if (this.attendance.ForMonth !== null && this.attendance.ForMonth > 0) {
      searchString += ` ${delimiter} ForMonth = ${this.attendance.ForMonth}`;
      delimiter = "and";
    }

    if (this.attendance.ForYear !== null && this.attendance.ForYear > 0) {
      searchString += ` ${delimiter} ForYear = ${this.attendance.ForYear}`;
      delimiter = "and";
    }

    if (searchString != "") {
      this.attendanceReviewData.SearchString = ` 1=1 and ${searchString}`;
    } else {
      this.attendanceReviewData.SearchString = "1=1";
    }

    this.getReviewAttendanceDetail();
  }

  resetAttedanceReviewFilter() {
    this.attendanceReviewData.reset();
    this.attendanceReviewData.ForMonth = this.attendance.ForMonth + 1;
    this.attendanceReviewData.ForYear = this.attendance.ForYear ;
    this.attendanceReviewData.SearchString = ` 1=1 `;
    let date = new Date();
    this.attendance = {
      EmployeeName: "",
      ForMonth: date.getMonth() + 1,
      ForYear: date.getFullYear()
    }
    this.getReviewAttendanceDetail()
  }

  showAttendanceHandler(item: any, id: number, name: string) {
    if (id <= 0) {
      ErrorToast("Invalid employee selected");
      return;
    }
    if (item) {
      this.selectedAttendance = null;
      this.selectedAttendance = item;
      this.selectedAttendance.EmployeeName = name;
      this.selectedAttendance.AttendanceId = id;
      $('#attendanceAdjustmentModal').modal('show');
    }
  }

  saveAttedanceAjustment() {
    this.isLoading = true;
    if (!this.selectedAttendance) {
      this.isLoading = false;
      ErrorToast("Please select attendance first");
      return;
    }

    if (this.selectedAttendance.AttendanceId <= 0 || this.selectedAttendance.AttendanceDate == null) {
      this.isLoading = false;
      return;
    }

    this.http.post('Attendance/AdjustAttendance', this.selectedAttendance).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        // let attendance = this.attendanceDetail.find(x => x.AttendanceId == this.selectedAttendance.AttendanceId);
        // if (attendance) {
        //   attendance.AttendanceDetail = [];
        //   attendance.AttendanceDetail = res.ResponseBody;
        // }
        this.selectedAttendance.AttendanceStatus = res.ResponseBody.AttendanceStatus;
        $('#attendanceAdjustment').modal('hide');
        Toast("Attendace apply successfully.");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    });
  }

  selectAllAttendance(e: any) {
    let value = e.target.checked;
    let elem = document.querySelectorAll('input[data-name="attendance-checkbox"]') ;
    elem.forEach(x => {
      (x as HTMLInputElement).checked = value;
    });
    if (value) {
      this.selectedAttendanceRequest = this.attendanceDetail;
    } else {
      this.selectedAttendanceRequest = [];
    }

  }

  selectAttendance(e: any, item: any) {
    let value = e.target.checked;
    if (value) {
      this.selectedAttendanceRequest.push(item)
    } else {
      let index = this.selectedAttendanceRequest.findIndex(x => x.AttendanceId == item.AttendanceId);
      this.selectedAttendanceRequest.splice(index, 1);
    }

    console.log(this.selectedAttendanceRequest);
  }
}

interface Attendance {
  ReportingManagerId?,
  EmployeeId?,
  ForMonth,
  ForYear,
  PresentDayStatus?,
  PageIndex?,
  TotalDays?,
  EmployeeName?: string
}

interface Leave {
  ReportingManagerId,
  EmployeeId,
  FromDate,
  ToDate,
  RequestStatusId,
  PageIndex
}

interface Timesheet {
  ReportingManagerId,
  EmployeeId,
  ForYear,
  TimesheetStatus,
  PageIndex,
  TimesheetStartDate?,
  TimesheetEndDate?,
  Days?
}
