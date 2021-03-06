import { switchMap, filter, first } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ExplorerService } from '../../../services/explorer/explorer.service';
import { Block } from '../../../app.datatypes';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'app/services/api/api.service';

@Component({
  selector: 'app-block-details',
  templateUrl: './block-details.component.html',
  styleUrls: ['./block-details.component.scss']
})
export class BlockDetailsComponent implements OnInit {
  block: Block;
  loadingMsg = '';
  longErrorMsg: string;
  blockCount: number;

  constructor(
    private explorer: ExplorerService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private api: ApiService,
  ) {
    translate.get('general.loadingMsg').subscribe((res: string) => {
      this.loadingMsg = res;
    });
  }

  ngOnInit() {

    this.api.getBlockchainMetadata().pipe(first()).subscribe(blockchain => this.blockCount = blockchain.blocks);

    let blockID = '';
    this.route.params.pipe(filter(params => +params['id'] !== null),
      switchMap((params: Params) => {
        blockID = params['id'];
        return this.explorer.getBlock(+blockID);
      })).subscribe((block: Block) => {
        if (block != null) {
          this.block = block;
        } else {
          this.translate.get(['general.noData', 'blockDetails.doesNotExist'], {number: blockID}).subscribe((res: string[]) => {
            this.loadingMsg = res['general.noData'];
            this.longErrorMsg = res['blockDetails.doesNotExist'];
          });
        }
      }, error => {
        if (error.status >= 400 && error.status < 500) {
          this.translate.get(['general.noData', 'blockDetails.doesNotExist'], {number: blockID}).subscribe((res: string[]) => {
            this.loadingMsg = res['general.noData'];
            this.longErrorMsg = res['blockDetails.doesNotExist'];
          });
        } else {
          this.translate.get(['general.shortLoadingErrorMsg', 'general.longLoadingErrorMsg']).subscribe((res: string[]) => {
            this.loadingMsg = res['general.shortLoadingErrorMsg'];
            this.longErrorMsg = res['general.longLoadingErrorMsg'];
          });
        }

      });
  }
}
