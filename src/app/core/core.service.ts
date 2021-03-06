import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { AppService } from '../app.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import "rxjs/add/operator/do";

import { UserGame } from './../profile/user-games/user-games';

@Injectable()
export class CoreService {

    private sliderGames = this.appService.getUrl('/app/sliderGames');
    private allGames = this.appService.getUrl('/app/paginationGames');
    private userGamesUrl = this.appService.getUrl('/app/users');

    constructor (private http: Http, private appService: AppService) {}

    getUserGames(id: string): Observable<UserGame[]>{
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });

      return this.http.get(`${this.userGamesUrl}/${id}/userGames`, options)
                      .map(this.appService.extractData)
                      .catch(this.appService.handleError);
    }

    getGames(): Observable<UserGame[]>{
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });

      return this.http.get(this.sliderGames, options)
                      .map(this.appService.extractData)
                      .catch(this.appService.handleError);
    }

    getAllGames(): Observable<UserGame[]>{
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });

      return this.http.get(this.allGames, options)
                      .map(this.appService.extractData)
                      .catch(this.appService.handleError);
    }
}
