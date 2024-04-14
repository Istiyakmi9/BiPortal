import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CapacityManagement, ManageProject, ProjectBudget, ProjectList, ProjectWiki, UserProjectList } from 'src/providers/constants';
import { ManageProjectComponent } from './manage-project/manage-project.component';
import { ProjectsComponent } from './projects.component';
import { WikiComponent } from './wiki/wiki.component';
import { BudgetComponent } from './budget/budget.component';
import { CapacityManagementComponent } from './capacity-management/capacity-management.component';

const routes: Routes = [
  { path: ProjectWiki, component: WikiComponent },
  { path: ProjectList, component: ProjectsComponent },
  { path: UserProjectList, component: ProjectsComponent },
  { path: ProjectBudget, component: BudgetComponent },
  { path: ManageProject, component: ManageProjectComponent },
  { path: CapacityManagement, component: CapacityManagementComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }
