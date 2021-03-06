import { Component, OnInit , ElementRef, Input, ViewChild} from '@angular/core';
import { Http, Response, RequestOptions, Headers, Request, RequestMethod} from '@angular/http';
import { UserGame } from './user-games';
import { AppService } from '../../app.service';
import { UserGameService } from './user-games.service';
import { UserConfigService } from './../user-config/user-config.service';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { UserInfo } from '../user-info/user-info';
import { Router } from '@angular/router';
import { PagerService } from '../../pager.service';
import { ProfileService } from '../profile.service';

@Component({
  selector: 'app-user-games',
  templateUrl: './user-games.component.html',
  styleUrls: ['./user-games.component.scss'],
  providers: [UserGameService, AppService, UserConfigService, PagerService]
})

export class UserGamesComponent implements OnInit {

  @ViewChild('closeModal') closeModal: ElementRef;

  // PAGER

  pager: any = {totalPages: 1};
  pagedItems: any[];

  errorMessage: string;
  status: string;
  userGame: UserGame[];
  userInfo: UserInfo;
  gameImgName: string;
  numberOfGames: number;

  model = {
    title: '',
    category: '',
    state: ''
  }

  public URL = this.appService.getUrl('/app/coverUpload');

  constructor (
    private http: Http,
    private el: ElementRef,
    private appService: AppService,
    private userGameService: UserGameService,
    private userConfigService: UserConfigService,
    private router: Router,
    private pagerService: PagerService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.getUserInfo();
    this.profileService.getUserInfo();
    this.getUserGame();
  }

  urlNewGameImage: any;
  urlEditedGameImage: any;

  showNewGameThumbnail(event:any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.onload = (event:any) => {
        this.urlNewGameImage = event.target.result;
      }

      reader.readAsDataURL(event.target.files[0]);
    }
  }

  showEditGameThumbnail(event:any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.onload = (event:any) => {
        this.urlEditedGameImage = event.target.result;
      }

      reader.readAsDataURL(event.target.files[0]);
    }
  }

  public coverUploader:FileUploader = new FileUploader({url: this.URL, itemAlias: 'photo'});

  onChange(event: EventTarget) {

    this.coverUploader.onAfterAddingFile = (file)=> { file.withCredentials = false; };
    this.coverUploader.onCompleteItem = (item:any, response:any, status:any, headers:any) => {};

    let file: File;
    let eventObj: MSInputMethodContext = <MSInputMethodContext> event;
    let target: HTMLInputElement = <HTMLInputElement> eventObj.target;
    let files: FileList = target.files;
    file = files[0];
    this.gameImgName = file.name;

  }


  addUserGame(title: string, category: string, state: string, description: string, Image: string) {

    if(Image == ""){
      this.gameImgName = "default.png";
    }

    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    var userID = currentUser._id;

    var createdDate = new Date().toString();

    if (!title || !category || !state) { return; }

    if(title.length >= 3) {
      this.userGameService.create(title, category, state, description, createdDate, userID, this.gameImgName)
                       .subscribe(
                          userGame  => {
                            this.userGame;
                            this.getUserGame();
                            this.increaseNumberOfGames(userID);
                            this.appService.showNotification('Powiadomienie', 'Dodano nową grę.', 'success');
                            this.closeModal.nativeElement.click();
                            this.model.title = '';
                            this.coverUploader.uploadAll();
                            setTimeout(() => {
                              this.coverUploader.clearQueue();
                            }, 250);
                            this.urlNewGameImage = '';
                          },
                          error =>  {
                            this.errorMessage = <any>error
                          });
    }

  }


  editUserGame(id: string, title: string, category: string, state: string, description: string, modifiedDate: string, Image: string) {
    var currentDate = new Date();
    var modifiedDate = currentDate.getFullYear().toString() + '-' +
               ('0' + (currentDate.getMonth()+1).toString()).slice(-2) + '-' +
               ('0' + (currentDate.getDate()).toString()).slice(-2);

    this.userGameService.update(id, title, category, state, description, modifiedDate, this.gameImgName)
                        .subscribe(
                            userGame => {
                              this.userGame;
                              this.getUserGame();
                              this.appService.showNotification('Powiadomienie', 'Zapisano zmiany.', 'success');
                              this.coverUploader.uploadAll();
                              setTimeout(() => {
                                this.coverUploader.clearQueue();
                              }, 250);
                              this.urlEditedGameImage = '';
                            },
                            error =>  {
                              this.errorMessage = <any>error
                            });
  }

  removeUserGame(id: string) {
    this.userGameService.delete(id)
                        .subscribe(
                            userGame  => {
                              this.userGame;
                              this.getUserGame();
                              this.profileService.getUserInfo();
                              this.appService.showNotification('Powiadomienie', 'Gra została usunięta.', 'success');
                            },
                            error => {
                              this.errorMessage = <any>error
                            });
  }

  getUserGame() {
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    var userID = currentUser._id;

    this.userGameService.getGames(userID)
                        .subscribe(
                            userGame => {
                              this.userGame = userGame.reverse();
                              this.setPage(1);
                            },
                            error => this.errorMessage = <any>error);
    }

  getUserInfo() {
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    var userID = currentUser._id;

    this.userConfigService.getUser(userID)
                          .subscribe(
                              userInfo => {
                                this.userInfo = userInfo;
                                this.numberOfGames = userInfo.numberOfGames;
                              },
                              error => this.errorMessage = <any>error);
  }

  increaseNumberOfGames(id: string){
    this.numberOfGames+=1;
    this.profileService.userInfo.numberOfGames+=1;
    this.editUserInfo(id);
  }

  decreaseNumberOfGames(id: string){
    this.numberOfGames-=1;
    this.editUserInfo(id);
  }

  editUserInfo(id: string) {
    var password = "";
    this.userConfigService.updateUser(id, this.userInfo.dateBirth, this.userInfo.city, this.userInfo.contactNumber, this.userInfo.avatarImage, password,
                                      this.numberOfGames, this.userInfo.numberOfExchanges, this.userInfo.numberOfRatings, this.userInfo.sumOfGrades, true)
                          .subscribe(
                                userInfo  => {
                                    // this.userInfo;
                                    this.getUserInfo();
                                },
                                error =>  {
                                    this.errorMessage = <any>error
                                }
                          );
  }

  setPage(page: number) {
    if (page < 1) {
      return;
    }
    this.pager = this.pagerService.getPager(this.userGame.length, page);
    this.pagedItems = this.userGame.slice(this.pager.startIndex, this.pager.endIndex + 1);
    this.router.navigate(['/profile/games'], {queryParams: {page: page}});
  }
}
