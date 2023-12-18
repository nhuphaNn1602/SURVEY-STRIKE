import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-thumbs-survey',
  templateUrl: './thumbs-survey.component.html',
  styleUrls: ['./thumbs-survey.component.scss']
})
export class ThumbsSurveyComponent {
  @Input() question: string = '';
  thumbsUpSelected: boolean | null = null;

  setThumbsUp(selected: boolean) {
    this.thumbsUpSelected = selected;
  }
}
