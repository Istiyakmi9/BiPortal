import { ApplicationStorage } from "./../../providers/ApplicationStorage";
import { CoreHttpService } from "../../providers/AjaxServices/core-http.service";
import { CommonService, Toast, UserDetail } from "./../../providers/common-service/common.service";
import { AccessTokenExpiredOn, AdminNotification, AdminResetPassword, Blogs, BuildPdf, CompanyLogo, CompanySettings, Documents, EmailService, Employees, Login, OrganizationStruct, Profile } from "./../../providers/constants";
import { Component, OnInit, Input, Output, EventEmitter, DoCheck } from "@angular/core";
import { iNavigation } from "src/providers/iNavigation";
import { JwtService, ResponseModel } from "src/auth/jwtService";
import { UserService } from "src/providers/userService";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"]
})
export class NavbarComponent implements OnInit, DoCheck {
  public sidebarOpened = false;
  public sizeOptions: Array<number> = [1,2, 3, 4, 5, 6, 7, 8, 9, 10];
  User: string;
  NotificationBadge: number = 0;
  InformationBadge: number = 0;
  NotificationDetail: Array<PopOverDetail> = [];
  InformationDetail: Array<PopOverDetail> = [];
  IsLoggedIn: boolean = false;
  PageName: string = BuildPdf;
  Messages: Array<string> = [];
  userDetail: UserDetail = new UserDetail();
  Menu: Array<any> = [];
  TineMenu: boolean = false;
  isAdmin: boolean = true;
  root: any = null;
  isLoading: boolean = false;
  logo: string = "";
  @Output() authentication = new EventEmitter();
  selectedColor: string = "#ffffff";
  currentStyle: any = null;

  toggleOffcanvas() {
    let $doc: any = document;
    this.sidebarOpened = !this.sidebarOpened;
    if (this.sidebarOpened) {
      $doc.querySelector(".sidebar-offcanvas").classList.add("active");
    } else {
      $doc.querySelector(".sidebar-offcanvas").classList.remove("active");
    }
  }

  constructor(
    private nav: iNavigation,
    private commonService: CommonService,
    private http: CoreHttpService,
    private local: ApplicationStorage,
    private tokenHelper: JwtService,
    private user: UserService
  ) {
    this.root = document.body;
    this.commonService.isLoading.subscribe(res => {
      this.isLoading = res;
    })
  }

  ngDoCheck(): void {
    let data = this.local.findRecord("UserDetail");
    let company = this.local.findRecord("Companies");
    this.currentStyle = this.local.getMenuStyle();
    if (this.currentStyle) {
      this.selectedColor = this.currentStyle.NavbarColor;
    }
    if(data) {
      if (data.UserTypeId == 1)
        this.isAdmin = true;
      else
        this.isAdmin = false;

        if (company) {
          this.logo = `${this.http.GetImageBasePath()}${company[0].LogoPath}`;
        }
    } else {
      this.GoToLoginPage();
    }


  }

  ngOnInit() {
    this.IsLoggedIn = false;
    let expiredOn = this.local.getByKey(AccessTokenExpiredOn);
    this.userDetail = this.user.getInstance() as UserDetail;
    if(expiredOn === null || expiredOn === "")
      this.userDetail["TokenExpiryDuration"] = new Date();
    else
      this.userDetail["TokenExpiryDuration"] = new Date(expiredOn);

    if(this.userDetail.TokenExpiryDuration.getTime() - (new Date()).getTime() <= 0 && expiredOn !== null) {
      this.http.post("login/AuthenticateUser", this.userDetail).then(
        (response: ResponseModel) => {
          if(response.ResponseBody !== null) {
            this.IsLoggedIn = true;
            this.userDetail = response.ResponseBody["UserDetail"];
            this.Menu = response.ResponseBody["Menu"];
            this.local.set(response.ResponseBody);
            this.tokenHelper.setJwtToken(this.userDetail['Token'], this.userDetail.TokenExpiryDuration.toString());
          } else {
            this.IsLoggedIn = false;
            this.local.set("");
          }
        },
        error => {
          this.IsLoggedIn = false;
          this.commonService.ShowToast(
            "Your session expired. Please login again."
          );
        }
      );
    } else {
      let Master = this.local.get(null);
      if(Master !== null && Master !== "") {
        this.IsLoggedIn = true;
        this.userDetail = Master["UserDetail"];
        this.Menu = Master["Menu"];
      }
    }
  }

  navLogoPage() {
    this.nav.navigateRoot(CompanyLogo, null);
  }

  ViewUserProfile() {

  }

  landLoginPage() {
    this.nav.navigate(Login, null);
  }

  LoadDocFiles() {
    this.nav.navigate(Documents, null);
  }

  Loademployees() {
    this.nav.navigate(Employees, null);
  }

  CleanUpDetail() {

  }

  LogoutUser() {
    this.nav.logout();
    Toast("Log out successfully");
    this.nav.navigate("/", null);
  }

  NavigatetoHome() {
    this.nav.navigate("", null);
  }

  GoToLoginPage() {
    this.nav.navigate(Login, null);
  }

  GoBlogsPage() {
    this.nav.navigate(Blogs, null);
  }

  AutoDemo() {
    this.nav.navigate("/", null);
  }

  navCompanySetting() {
    this.nav.navigateRoot(CompanySettings, null);
  }

  navOrgStructure() {
    this.nav.navigateRoot(OrganizationStruct, null);
  }

  resetPassword() {
    this.nav.navigate(AdminResetPassword, null);
  }

  mangeAccount() {
    this.nav.navigate(Profile, null);
  }

  navEmailPage() {
    this.nav.navigateRoot(EmailService, null);
  }

  navNotificationPage() {
    this.nav.navigateRoot(AdminNotification, null);
  }

  toggleMenu() {
    let $e = document.getElementById("page-menu");
    if($e && !this.TineMenu) {
      $e.classList.add("d-block");
    } else {
      $e.classList.remove("d-block");
    }
    this.TineMenu = !this.TineMenu;
  }

  balanceZooming(e: any) {
    let value = Number(e.target.value);
    let size = this.commonService.GetDefaultFontSize();
    size += value * 0.01;
    this.root.setAttribute("style", `font-size: ${size}vw !important`);
    // this.commonService.SetDefaultFontSize(size);
  }

  undozooming() {
    let size = 0.80;
    this.root.setAttribute("style", `font-size: ${size}vw !important`);
    this.commonService.SetDefaultFontSize(size);
  }

  changeColor(e: any) {
    this.selectedColor = e.target.value;
    this.http.post("Settings/LayoutConfigurationSetting", {
      IsMenuExpanded: this.currentStyle == null ? true : this.currentStyle.IsMenuExpanded,
      NavbarColor: this.selectedColor
    }).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        Toast("User layout configuration save.");
        this.local.updateLayoutConfig(response.ResponseBody);
      }
    });
  }
}

interface PopOverDetail {
  imgName: string;
  name: string;
  time: string;
  message: string;
}
