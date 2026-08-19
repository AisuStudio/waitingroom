// Where a rule plugs in — Angular + PrimeNG.
//
// Deliberately NOT in rules/. A rule is one file and is framework-neutral, so
// it still holds when the component library moves a major version. The wiring
// is per-stack and disposable, and putting it next to the rule would make the
// rule look like it depends on Angular. It does not. If a second stack ever
// needs the same rules, it gets a second file here and rules/ does not change.
//
// These are starting points, not patches. They are written against PrimeNG's
// current control names and standalone-component syntax; the team's actual
// version and conventions are still an open question.

export const angularWiring = {
  'selection/control-type': {
    caveat: 'p-select was called p-dropdown before PrimeNG 18. If the project is '
          + 'on an older major, the switch case is the only line that changes.',
    files: [
      {
        name: 'purpose-selection.component.ts',
        code: `import { controlType } from '../rules/selection';

@Component({
  selector: 'app-purpose-selection',
  templateUrl: './purpose-selection.component.html',
})
export class PurposeSelectionComponent implements OnChanges {
  @Input() options: Option[] = [];
  @Input() value?: string;

  control: 'none' | 'fixed' | 'radio' | 'select' = 'none';

  ngOnChanges() {
    // Decided when the list is final, never mid-interaction — the user would
    // be clicking a control that is no longer there. See the edge cases.
    this.control = controlType(this.options.length);
  }
}`,
      },
      {
        name: 'purpose-selection.component.html',
        code: `<ng-container [ngSwitch]="control">

  <div *ngSwitchCase="'radio'" class="field">
    <p-radioButton
      *ngFor="let o of options"
      [value]="o.value" [label]="o.label" [(ngModel)]="value" />
  </div>

  <p-select *ngSwitchCase="'select'"
    [options]="options" [(ngModel)]="value" />

  <!-- One option is not a choice and must not look like one. -->
  <span *ngSwitchCase="'fixed'" class="field-fixed">{{ options[0].label }}</span>

  <!-- 'none' has no case: the field is not rendered at all. -->

</ng-container>`,
      },
    ],
  },

  'disclosure/conditional-fields': {
    caveat: 'The one thing to get right: disable, never removeControl. Removing '
          + 'the control drops its value, and the rule says a withdrawn field keeps '
          + 'what it held.',
    files: [
      {
        name: 'change-of-address.component.ts',
        code: `import { visibleFields, BASE_FIELDS } from '../rules/disclosure';

export class ChangeOfAddressComponent implements OnInit {
  form = this.fb.group({ /* every field, base and conditional */ });
  shown = new Set<string>(BASE_FIELDS);

  ngOnInit() {
    this.sync();
    this.form.valueChanges.subscribe(() => this.sync());
  }

  private sync() {
    const next = new Set([...BASE_FIELDS, ...visibleFields(this.form.getRawValue())]);

    for (const key of Object.keys(this.form.controls)) {
      const control = this.form.get(key)!;
      // disable(), not removeControl(): withdrawing a field is not a request
      // to delete the answer. It comes back unchanged if the field returns.
      if (next.has(key)) control.enable({ emitEvent: false });
      else control.disable({ emitEvent: false });
    }

    this.shown = next;
  }
}`,
      },
      {
        name: 'change-of-address.component.html',
        code: `<form [formGroup]="form">

  <!-- Base fields, always, in their fixed order -->
  <app-field formControlName="maritalStatus" label="Marital status" />

  <!-- Each conditional field directly after the answer it follows from, so a
       new field never appears somewhere the eye is not already looking. -->
  <app-field *ngIf="shown.has('partnerDetails')"
             formControlName="partnerDetails" label="Partner" />

  <app-field *ngIf="shown.has('formerName')"
             formControlName="formerName" label="Name before marriage" />

</form>`,
      },
    ],
  },

  'names/truncation': {
    caveat: 'Measure text, do not count characters. "Iyer" and "IIII" are the same '
          + 'length and different widths, and a rule that counts will be wrong on '
          + 'exactly the names that matter.',
    files: [
      {
        name: 'waiting-list.component.ts',
        code: `import { fitName } from '../rules/names';

export class WaitingListComponent {
  @Input() rows: Row[] = [];
  @Input() nameColumnWidth = 300;

  // One canvas for the component. The font has to match what the cell really
  // renders in, or the measurement describes a different column.
  private ctx = document.createElement('canvas').getContext('2d')!;
  private measure = (text: string) => {
    this.ctx.font = this.cellFont;
    return this.ctx.measureText(text).width;
  };

  cell(row: Row) {
    return fitName(row.name, this.nameColumnWidth, this.measure);
  }
}`,
      },
      {
        name: 'waiting-list.component.html',
        code: `<ng-template pTemplate="body" let-row>
  <tr>
    <td class="name-cell" *ngIf="cell(row) as name">
      <span>{{ name.line1 }}</span>

      <span *ngIf="name.original" class="original">
        ({{ row.name.original }})
      </span>

      <!-- A second line, not an ellipsis. The row grows; nothing is cut. -->
      <span *ngIf="name.line2" class="second-line">{{ name.line2 }}</span>
    </td>
  </tr>
</ng-template>`,
      },
    ],
  },
};
