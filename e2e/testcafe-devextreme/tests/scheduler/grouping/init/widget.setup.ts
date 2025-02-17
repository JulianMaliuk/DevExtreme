import { extend } from 'devextreme/core/utils/extend';
import { createWidget } from '../../../../helpers/createWidget';

const priorityData = [
  {
    text: 'Low Priority',
    id: 1,
    color: '#1e90ff',
  }, {
    text: 'High Priority',
    id: 2,
    color: '#ff9747',
  },
];

export default async (options = {}): Promise<void> => createWidget('dxScheduler', extend({
  views: ['week'],
  dataSource: [],
  resources: [
    {
      fieldExpr: 'priorityId',
      allowMultiple: false,
      dataSource: priorityData,
      label: 'Priority',
    },
  ],
  groups: ['priorityId'],
  crossScrollingEnabled: true,
  groupByDate: false,
  width: 1666,
  height: 833,
  startDayHour: 9,
  firstDayOfWeek: 1,
  maxAppointmentsPerCell: 5,
  currentView: 'week',
  currentDate: new Date(2018, 4, 21),
}, options));
