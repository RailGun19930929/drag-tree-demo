import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TreeDemoComponent } from './tree-demo/tree-demo.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tree' },
  { path: 'tree', component: TreeDemoComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
