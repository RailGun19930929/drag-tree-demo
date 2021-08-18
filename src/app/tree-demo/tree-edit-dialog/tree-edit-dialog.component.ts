import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FlatTree } from 'src/app/interface/tree';

@Component({
  selector: 'app-tree-edit-dialog',
  templateUrl: './tree-edit-dialog.component.html',
  styleUrls: ['./tree-edit-dialog.component.scss']
})
export class TreeEditDialogComponent implements OnInit {

  form!: FormGroup;
  typeList: number[] = [
    1, 2, 3, 10
  ];

  constructor(
    private dialogRef: MatDialogRef<TreeEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: FlatTree,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: this.fb.control(this.data.name, { validators: [Validators.required] }),
      type: this.fb.control(this.data.type, { validators: [Validators.required] }),
    });
  }

  close(): void {
    this.dialogRef.close(null);
  }

  getImageByType(type: number): string {
    let imagePath = '';
    switch (type) {
      case 1:
        imagePath = 'assets/nodeIcon/concept.png';
        break;
      case 2:
        imagePath = 'assets/nodeIcon/main_concept.png';
        break;
      case 3:
        imagePath = 'assets/nodeIcon/function.png';
        break;
      case 10:
        imagePath = 'assets/nodeIcon/folder.png';
        break;
      default:
        break;
    }

    return imagePath;
  }

  ok(): void {
    if (this.form.valid) {
      const newData: FlatTree = Object.assign({} as FlatTree ,this.data, this.form.value);
      console.log(newData);
      this.dialogRef.close(newData);
    }
  }
}
