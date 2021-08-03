import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// material
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
// import { } from '@angular/material/';
// cdk
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkTreeModule } from '@angular/cdk/tree';
// import {} from '@angular/cdk';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: [
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    DragDropModule,
    CdkTreeModule,
  ],
})
export class MaterialModule { }
