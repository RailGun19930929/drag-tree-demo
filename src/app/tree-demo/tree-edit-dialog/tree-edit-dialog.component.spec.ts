import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeEditDialogComponent } from './tree-edit-dialog.component';

describe('TreeEditDialogComponent', () => {
  let component: TreeEditDialogComponent;
  let fixture: ComponentFixture<TreeEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreeEditDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
