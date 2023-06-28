import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { AuthInterceptor } from './auth/services/authinterceptor.service';
import { BoardModule } from './board/board.module';
import { BoardsModule } from './boards/boards.module';
import { HomeModule } from './home/home.module';
import { InlineFormComponent } from './shared/modules/inlineForm/components/inlineForm.component';
import { InlineFormModule } from './shared/modules/inlineForm/inlineForm.module';
import { SocketService } from './shared/services/socket.service';

@NgModule({
  declarations: [
    AppComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    HttpClientModule,
    CommonModule,
    HomeModule, 
    BoardsModule,
    ReactiveFormsModule,
    BoardModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    }, 
    SocketService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
