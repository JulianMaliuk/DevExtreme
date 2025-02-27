/* eslint-disable max-len */
import { Selector } from 'testcafe';
import { CellEditor } from 'devextreme-testcafe-models/dataGrid/data/cellEditor';
import DataGrid from 'devextreme-testcafe-models/dataGrid';
import DataCell from 'devextreme-testcafe-models/dataGrid/data/cell';
import EditForm from 'devextreme-testcafe-models/dataGrid/editForm';
import { ClassNames as CLASS } from 'devextreme-testcafe-models/dataGrid/classNames';
import { createWidget } from '../../helpers/createWidget';
import url from '../../helpers/getPageUrl';

fixture.disablePageReloads`Editing`
  .page(url(__dirname, '../container.html'));

const editingModes = [
  'cell',
  'batch',
  'row',
  'form',
  'popup',
];
const columnInfos = [
  {
    columnIndex: 0, dataField: 'text', newValue: 'xxxx', newMaskValue: 'xxxxx',
  },
  {
    columnIndex: 1, dataField: 'number', newValue: '-9', newMaskValue: '9-',
  },
  {
    columnIndex: 2, dataField: 'date', newValue: '10/1/2020', newMaskValue: '101',
  },
  { columnIndex: 3, dataField: 'lookup', newValue: 'lookup 2' },
  { columnIndex: 4, dataField: 'boolean', newValue: 'true' },
  { columnIndex: 5, dataField: 'calculated', newValue: '9' },
];
const repaintChangesOnlyValues = [
  false,
  true,
];

const useKeyboardValues = [
  false,
  true,
];

const useMaskValues = [
  false,
  true,
];

const isAddingValues = [
  false,
  true,
];

const dataGrid = new DataGrid('#container');

const createDataGrid = ({
  repaintChangesOnly, isAdding, mode, useMask,
}) => async (): Promise<void> => createWidget('dxDataGrid', {
  keyExpr: 'id',
  dataSource: [
    {
      id: 1, text: 'text 1', number: 1, date: '2020-10-27', boolean: false, lookup: 1,
    },
    {
      id: 2, text: 'text 2', number: 2, date: '2020-10-28', boolean: true, lookup: 2,
    },
  ],
  repaintChangesOnly,
  editing: {
    mode,
    allowAdding: isAdding,
    allowUpdating: true,
  },
  columns: [
    {
      dataField: 'text',
      editorOptions: {
        mask: useMask ? 'cccc' : undefined,
      },
    },
    {
      dataField: 'number',
      editorOptions: {
        format: '#0',
        useMaskBehavior: useMask,
      },
    },
    {
      dataField: 'date',
      dataType: 'date',
      editorOptions: {
        useMaskBehavior: useMask,
      },
    },
    {
      dataField: 'lookup',
      lookup: {
        valueExpr: 'id',
        displayExpr: 'text',
        dataSource: [
          { id: 1, text: 'lookup 1' },
          { id: 2, text: 'lookup 2' },
        ],
      },
    },
    { dataField: 'boolean' },
    {
      // name: 'calculated', TODO
      dataField: 'calculated',
      calculateCellValue: (data): number => (data as { number: number }).number + 1,
      setCellValue: (newData, value): void => {
        newData.number = value - 1;
      },
    },
  ],
});

const getEditForm = (mode): EditForm | null => {
  if (mode === 'form') {
    return dataGrid.getEditForm();
  }
  if (mode === 'popup') {
    return dataGrid.getPopupEditForm();
  }
  return null;
};

const editCell = async (t: TestController, {
  mode, dataField, useKeyboard, columnIndex,
}, rowIndex: number, modifyFirstColumn = false): Promise<{ cell: DataCell; editor: CellEditor }> => {
  const cell = dataGrid.getDataCell(rowIndex, columnIndex);
  let editor = cell.getEditor();

  const form = getEditForm(mode);
  if (form) {
    editor = new CellEditor(form.getItem(dataField));
  }

  if (useKeyboard) {
    await t
      .pressKey('tab');
  }

  if (mode === 'batch' && modifyFirstColumn) { // TODO
    await dataGrid.apiCellValue(rowIndex, 0, 'modified');
  }

  if (useKeyboard) {
    await t
    // .pressKey('tab')
      .pressKey('ctrl+down')
      .pressKey('enter');
    if (mode === 'popup') { // TODO
      await t
        .pressKey(columnInfos.map(() => 'tab').join(' '))
        .pressKey('enter')
        .wait(500);
    }
    for (let i = 0; i < columnIndex; i += 1) {
      await t.pressKey('tab');
    }
  } else if (mode === 'cell' || mode === 'batch') {
    await t.click(cell.element, { offsetX: 5 });
  } else {
    const editButton = dataGrid.getDataRow(rowIndex).getCommandCell(6).getButton(0);
    await t.click(editButton);

    if (columnIndex > 0) {
      const item = !form ? cell.element : editor.getItemLabel();
      await t.click(item, { offsetX: 5 });
    }
  }

  return { cell, editor };
};

const addRow = async (t: TestController, {
  mode, dataField, columnIndex, useKeyboard,
}): Promise<{ cell: DataCell; editor: CellEditor }> => {
  const cell = dataGrid.getDataCell(0, columnIndex);
  let editor = cell.getEditor();

  const form = getEditForm(mode);
  if (form) {
    editor = new CellEditor(form.getItem(dataField));
  }

  if (useKeyboard) {
    await t
      .pressKey('tab')
      .pressKey('enter')
      .wait(500);

    for (let i = 0; i < columnIndex; i += 1) {
      await t.pressKey('tab');
    }
  } else {
    const addRowButton = dataGrid.getHeaderPanel().getAddRowButton();
    await t.click(addRowButton);

    if (columnIndex > 0) {
      const item = !form ? cell.element : editor.getItemLabel();
      await t.click(item, { offsetX: 5 });
    }
  }

  return { cell, editor };
};

const checkEditCell = async (t: TestController, { mode, dataField }, cell: DataCell | undefined, editor: CellEditor | undefined): Promise<void> => {
  if (mode !== 'form' && mode !== 'popup') {
    await t.expect(cell?.isFocused).ok();
  }

  if (mode === 'row' && dataField === 'boolean') { // TODO
    return;
  }

  await t
    .expect(editor?.element.focused)
    .eql(true);
};

// eslint-disable-next-line max-len
const getEditorValue = async (dataField: string, editor: CellEditor): Promise<string | undefined> => {
  if (dataField === 'boolean') {
    return await editor.isChecked() ? 'true' : 'false';
  }

  return editor.element.value;
};

const getCellText = async (dataField: string, cell: DataCell): Promise<string | undefined> => {
  if (dataField === 'boolean') {
    return getEditorValue(dataField, cell.getEditor());
  }

  return cell.element.textContent;
};

const checkModifiedCell = async (t: TestController, { mode, dataField }, cell: DataCell, editor: CellEditor, value: string): Promise<void> => {
  const editorText = mode === 'batch' || mode === 'cell'
    ? await getCellText(dataField, cell)
    : await getEditorValue(dataField, editor);

  await t
    .expect(editorText)
    .eql(value);

  if (mode !== 'form' && mode !== 'popup') {
    await t
      .expect(cell.isEditCell)
      .eql(mode === 'row' || dataField === 'boolean')
      .expect(cell.isModified)
      .eql(mode === 'batch');

    await t
      .expect(DataCell.getModifiedCells().count)
      .eql(mode === 'batch' ? 2 : 0);
  }
};

const checkSavedCell = async (t: TestController, { dataField }, cell: DataCell, value: string): Promise<void> => {
  await t
    .expect(await getCellText(dataField, cell))
    .eql(value);

  await t
    .expect(cell.isEditCell)
    .eql(dataField === 'boolean');

  await t
    .expect(cell.isModified)
    .notOk();

  await t
    .expect(DataCell.getModifiedCells().count)
    .eql(0);
};

const clickSaveButton = async (t: TestController, {
  mode, useKeyboard, dataField, repaintChangesOnly,
}, rowIndex: number): Promise<void> => {
  const form = getEditForm(mode);
  let saveButton: Selector | undefined = form?.saveButton;
  if (useKeyboard) {
    await t.pressKey('enter');
    if (mode === 'batch') { // TODO
      saveButton = dataGrid.getHeaderPanel().getSaveButton();
    } else if (mode !== 'popup') { // TODO
      saveButton = undefined;
    }
  } else if (mode === 'batch') {
    saveButton = dataGrid.getHeaderPanel().getSaveButton();
  } else if (mode === 'row') {
    saveButton = dataGrid.getDataRow(rowIndex).getCommandCell(6).getButton(0);
  } else if (mode === 'cell') {
    saveButton = Selector('body');
  }
  if (saveButton) {
    await t.click(saveButton, { offsetX: 5, offsetY: 5 });
    if (dataField === 'calculated' && !repaintChangesOnly && (mode === 'row' || mode === 'form')) { // TODO
      await t.click(saveButton, { offsetX: 5, offsetY: 5 });
    }
  }
};

const setEditorValue = async (t: TestController, {
  mode, dataField, useKeyboard, useMask, newMaskValue, newValue,
}, editor: CellEditor): Promise<void> => {
  const value: string = useMask ? newMaskValue : newValue;
  if (dataField === 'date' && !useKeyboard && !useMask) {
    await t.click(editor.getDropDownButton());
    await t.click(Selector(`.${CLASS.calendarCell}`).withText(value.split('/')[1]));
  } else if (dataField === 'lookup' && !useKeyboard) {
    if (mode === 'cell' || mode === 'batch') {
      await t.click(editor.getDropDownButton());
    }
    await t.click(Selector(`.${CLASS.listItemContent}`).withText(value));
  } else if (dataField === 'boolean') {
    if (useKeyboard) {
      await t.pressKey('space');
    } else {
      await t.click(editor.element);
    }
  } else {
    await t
      .pressKey('ctrl+a')
      .pressKey(value.split('').map((k) => k.replace(' ', 'space')).join(' '));

    if (dataField === 'lookup' && useKeyboard) {
      await Selector(`.${CLASS.listItemContent}`).withText(value)();
      await t.pressKey('enter');
    }
  }
};

const editNextCell = async (t: TestController, {
  mode, dataField, columnInfoIndex, columnIndex, useKeyboard,
}, rowIndex: number): Promise<{ nextEditor: CellEditor | undefined; nextCell: DataCell | undefined }> => {
  const form = getEditForm(mode);

  let nextEditor: CellEditor | undefined;
  let nextCell: DataCell | undefined;
  if (form) {
    const nextColumnInfo = columnInfos[columnInfoIndex === 0 ? 1 : columnInfoIndex - 1];
    if (nextColumnInfo) {
      nextEditor = new CellEditor(form.getItem(nextColumnInfo.dataField));
      if (useKeyboard) {
        for (
          let i = 0; i < Math.abs(nextColumnInfo.columnIndex - columnIndex); i += 1
        ) {
          await t.pressKey(columnInfoIndex === 0 ? 'tab' : 'shift+tab');
        }
      } else {
        await t.click(nextEditor.element);
      }
    }
  } else {
    const nextColumnIndex = columnIndex === 0 ? 1 : columnIndex - 1;
    nextCell = dataGrid.getDataCell(rowIndex, nextColumnIndex);
    nextEditor = nextCell.getEditor();

    if (useKeyboard) {
      await t.pressKey(columnIndex === 0 ? 'tab' : 'shift+tab');
    } else {
      const isCellRevertBug = mode === 'cell' && columnIndex < nextColumnIndex; // TODO
      if (mode === 'batch') await t.click(dataGrid.element());// workaround for https://github.com/DevExpress/testcafe/issues/7277 TODO remove once fixed
      await t.click(nextCell.element, { offsetX: isCellRevertBug ? 50 : 5 });
    }
  }
  await checkEditCell(t, { mode, dataField }, nextCell, nextEditor);

  return { nextEditor, nextCell };
};

editingModes.forEach((mode) => {
  columnInfos.forEach(({
    columnIndex, dataField, newValue, newMaskValue,
  }, columnInfoIndex) => {
    const isBasicColumn = dataField === 'text' || dataField === 'calculated';
    isAddingValues.forEach((isAdding) => {
      if (isAdding && !isBasicColumn) {
        return;
      }
      useMaskValues.forEach((useMask) => {
        if (useMask && !newMaskValue) {
          return;
        }
        useKeyboardValues.forEach((useKeyboard) => {
          repaintChangesOnlyValues.forEach((repaintChangesOnly) => {
            if (repaintChangesOnly && (useKeyboard || useMask || !isBasicColumn)) {
              return;
            }

            const options = {
              mode,
              columnIndex,
              dataField,
              newValue,
              newMaskValue,
              columnInfoIndex,
              isAdding,
              useMask,
              useKeyboard,
              repaintChangesOnly,
            };

            const testCase = mode === 'cell'
            && dataField === 'text'
            && !repaintChangesOnly
            && useKeyboard
            && !useMask
            && !isAdding
              ? test.meta({ unstable: true }) : test;

            testCase(`Update cell value ${JSON.stringify({
              mode, dataField, repaintChangesOnly, useKeyboard, useMask, isAdding,
            })}`, async (t) => {
              const rowIndex = 0;

              const { cell, editor } = isAdding
                ? await addRow(t, options)
                : await editCell(t, options, rowIndex, true);

              await checkEditCell(t, options, cell, editor);

              await setEditorValue(t, options, editor);

              await clickSaveButton(t, options, isAdding ? rowIndex : 0);
              await checkSavedCell(
                t,
                options,
                isAdding ? dataGrid.getDataCell(2, columnIndex) : cell,
                newValue,
              );
            }).before(createDataGrid(options));

            if (isBasicColumn && !isAdding) {
              test(`Edit next cell ${JSON.stringify({
                mode, dataField, repaintChangesOnly, useKeyboard, useMask,
              })}`, async (t) => {
                const rowIndex = 0;

                const { cell, editor } = await editCell(t, options, rowIndex);
                await checkEditCell(t, options, cell, editor);

                await setEditorValue(t, options, editor);
                const { nextCell, nextEditor } = await editNextCell(t, options, rowIndex);
                await checkEditCell(t, options, nextCell, nextEditor);
                await checkModifiedCell(t, options, cell, editor, newValue);
              }).before(createDataGrid(options));
            }
          });
        });
      });
    });
  });
});
