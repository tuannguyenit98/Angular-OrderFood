import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ForgotPasswordPopupComponent } from 'src/app/shared/component/popups/forgot-password-popup/forgot-password-popup.component';
import ValidationHelper from 'src/app/shared/helpers/validation.helper';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
  formSignIn: FormGroup;
  invalidMessages: string[] = [];
  formErrors = {
    username: '',
    password: '',
  };
  isSubmit: boolean;
  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private router: Router,
    private notificationService: NzNotificationService,
    private modalService: NzModalService
  ) {}

  ngOnInit(): void {
    this.createdForm();
  }

  createdForm(): void {
    this.formSignIn = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  validateForm(): boolean {
    this.invalidMessages = ValidationHelper.getInvalidMessages(
      this.formSignIn,
      this.formErrors
    );
    return this.invalidMessages.length === 0;
  }

  onSubmit(): void {
    this.isSubmit = true;
    if (this.validateForm()) {
      this.authenticationService
        .login(this.formSignIn.value.username, this.formSignIn.value.password)
        .subscribe((result) => {
          this.authenticationService.setAuthenticationModel(result);
          this.router.navigate(['/']);
        });
    } else {
      this.notificationService.error(
        'Thông báo',
        'Tài khoản hoặc mật khẩu không đúng!',
        { nzPlacement: 'bottomRight' }
      );
    }
  }

  forgotPassword(): void {
    const modal = this.modalService.create({
      nzContent: ForgotPasswordPopupComponent
    });
    modal.afterClose.subscribe((result) => {
      if (result && result.isSuccess){
        this.notificationService.success(
          'Thông báo',
          'Vui lòng kiểm tra email để xác nhận!',
          { nzPlacement: 'bottomRight' }
        );
      }
    });
  }
}
