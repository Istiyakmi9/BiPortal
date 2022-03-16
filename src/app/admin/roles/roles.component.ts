import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { Toast } from 'src/providers/common-service/common.service';
declare var $:any;

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  rolesForm: FormGroup;
  profileURL: string = "assets/images/faces/face1.jpg";
  isRolesLoaded: boolean = false;
  Menu: Array<any> = [];
  roleMenuForm: FormGroup;
  menuItems: FormArray;
  RoleName: number = 0;
  PermissionValue: number = 0;
  Roles: Array<any> = [];
  addRoleForm: FormGroup;

  constructor(private fb: FormBuilder,
              private http: AjaxService) { }

  ngOnInit(): void {
    this.isRolesLoaded = false;
    this.http.get("Roles/GetRoles").then((response: ResponseModel) => {
      if (response.ResponseBody) {
        this.Roles = response.ResponseBody['Table']
      }
    })
    this.initForm(0, []);
    this.Roleform();
  }

  getPermessionName(permissionValue: number) {
    this.PermissionValue = permissionValue;
    switch(permissionValue) {
      case 1:
        return "Grant full access.";
      case 2:
        return "Read only permission.";
      case 3:
        return "Read & Write permission.";
      default:
        return "Pick one access type.";
    }
  }

  buildForm(menu: Array<any>) {
    let itemArray: FormArray = this.fb.array([]);
    let i = 0;
    while(i < menu.length) {
      if(menu[i].Childs != null) {
        itemArray.push(this.fb.group({
          Icon: new FormControl(menu[i].Icon),
          Catagory: new FormControl(menu[i].Catagory),
          Permission: new FormControl(menu[i].Permission),
          AccessCode: new FormControl(menu[i].AccessCode),
          ParentMenu: new FormControl(menu[i].Childs)
        }));
      }
      i++;
    }
    return itemArray;
  }

  initForm(accessValue: number, menu: Array<any>) {
    this.rolesForm = this.fb.group({
      accessLevel: new FormControl(Number(accessValue)),
      menuItems: this.buildForm(menu)
    });
  }

  loadMenu(e: any) {
    this.Menu = [];
    let accessLevelId = Number(e.target.value);
    if (accessLevelId > 0) {
      this.http.get(`Roles/GetMenu/${accessLevelId}`).then((response:ResponseModel) => {
        if (response.ResponseBody != null) {
          let menu = response.ResponseBody['Table'];
          let parentItems = menu.filter(x => x.Childs == null);
          if (parentItems.length > 0) {
            let i = 0;
            while(i < parentItems.length) {
              this.Menu.push({
                Name: parentItems[i].Catagory,
                AccessCode: parentItems[i].AccessCode,
                ParentDetail: parentItems[i],
                value: menu.filter (x => x.Childs == parentItems[i].Catagory)
              });
              i++;
            }

            this.initForm(accessLevelId, menu);
            this.isRolesLoaded = true;
          }
        }
      })
    }
  }

  selectPermission(i: any, position: number) {
    let items = this.rolesForm.controls["menuItems"] as FormArray;
    let elem: FormGroup = items.controls[position] as FormGroup;
    if(elem) {
      elem.get("Permission").setValue(i);
    }
  }

  addRootCatagory(items: Array<any>) {
    this.Menu.map(item => {
      items.push({
        Icon: '',
        Catagory: item.Name,
        Permission: 1,
        AccessCode: item.AccessCode,
        ParentMenu: null
      });
    });
  }

  submitRole() {
    let RolesAndMenu = {};
    let items = this.rolesForm.controls["menuItems"] as FormArray;
    let access = this.rolesForm.controls['accessLevel'] as FormControl;

    this.addRootCatagory(items.value);
    RolesAndMenu = {
      AccessLevelId: access.value,
      menu: items.value
    };

    this.http.post("Roles/AddUpdatePermission", RolesAndMenu).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        Toast("Permission added or updated successfully")
      }
    });
  }

  Roleform() {
    this.addRoleForm = this.fb.group({
      RoleName: new FormControl('', Validators.required),
      AccessCodeDefination: new FormControl('')
    })
  }

  addRolePopUp() {
    $('#addRole').modal('show');
  }

  CloseFolderPopup() {
    $('#addRole').modal('hide');
  }

  AddRole() {
    let formValue = this.addRoleForm.value;
    if (formValue) {
      this.http.post("Roles/AddRole", formValue).then((response:ResponseModel) => {
        if (response.ResponseBody) {
          Toast("Role added successfully")
          this.Roles = response.ResponseBody['Table']
        }
      })
    };
    this.CloseFolderPopup();
  }
}
