import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { catchError, concatMap, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../services';
import { authActions } from '../actions';
import { userActions } from '../actions';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.loginRequest),
      switchMap((action) =>
        this.authService.login(action.username, action.password).pipe(
          concatMap((response) => {
            if (response.status) {
              // Trigger success toast notification
              this.toastrService.success('Login successful');
              // Return an array of actions
              return [
                authActions.loginSuccess(),
                userActions.getUserDataRequest(),
              ];
            } else {
              // Trigger error toast notification
              this.toastrService.error(response.message || 'Login failed');
              return [authActions.loginFailure()];
            }
          }),
          catchError((error) => {
            // Trigger error toast notification
            this.toastrService.error(
              error.message || 'An error occurred during login'
            );
            return [authActions.loginFailure()];
          })
        )
      )
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.logoutRequest),
      switchMap(() =>
        this.authService.logout().pipe(
          map((response) => {
            if (response.status) {
              this.toastrService.success('Logout successful');
              return authActions.logoutSuccess();
            } else {
              this.toastrService.error(response.message || 'Logout failed');
              return authActions.logoutFailure();
            }
          }),
          catchError((error) => {
            this.toastrService.error('An error occurred during logout');
            return of(authActions.logoutFailure());
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private toastrService: ToastrService
  ) {}
}