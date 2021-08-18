import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// material
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
// import { } from '@angular/material/';
// cdk
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkTreeModule } from '@angular/cdk/tree';
import { A11yModule } from '@angular/cdk/a11y';
// import {} from '@angular/cdk';
import { ReactiveFormsModule } from '@angular/forms';

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
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    A11yModule,
    MatTableModule,
  ],
})
export class MaterialModule { }
