import { ShareModule } from './share/share.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TreeDemoComponent } from './tree-demo/tree-demo.component';
import { HttpClientModule } from '@angular/common/http';
import { TreeEditDialogComponent } from './tree-demo/tree-edit-dialog/tree-edit-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    TreeDemoComponent,
    TreeEditDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ShareModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
