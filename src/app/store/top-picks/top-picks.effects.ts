import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { TopPicksService } from '../../services/top-picks.service';
import { TopPicksActions } from './top-picks.actions';

@Injectable()
export class TopPicksEffects {
  private readonly actions$ = inject(Actions);
  private readonly topPicksService = inject(TopPicksService);

  readonly loadTopPicks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TopPicksActions.loadTopPicks, TopPicksActions.refreshTopPicks),
      switchMap(() =>
        this.topPicksService.getTopPicks().pipe(
          map((picks) => TopPicksActions.loadTopPicksSuccess({ picks })),
          catchError((error) =>
            of(
              TopPicksActions.loadTopPicksFailure({
                error: error?.message ?? 'Unable to load top picks'
              })
            )
          )
        )
      )
    )
  );
}
