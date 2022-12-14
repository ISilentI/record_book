import * as React from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { visuallyHidden } from '@mui/utils';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import OptionsMenu from '../../menus/OptionsMenu';
import { getComparator, stableSort } from '../../../../utils/functions';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Stack } from '@mui/system';
import API from '../../../../api';

const headCells = [
  {
    id: 'date',
    numeric: false,
    disablePadding: true,
    label: 'Дата',
  },
  {
    id: 'subject',
    numeric: false,
    disablePadding: false,
    label: 'Предмет',
  },
  {
    id: 'semester',
    numeric: false,
    disablePadding: false,
    label: 'Семетр/Год',
  },
  {
    id: 'type',
    numeric: false,
    disablePadding: false,
    label: 'Тип',
  },
  {
    id: 'mark',
    numeric: false,
    disablePadding: false,
    label: 'Оценка',
  },
  {
    id: 'options',
    numeric: false,
    disablePadding: true,
    label: '',
  },
];

function EnhancedTableHead(props) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = property => event => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding='checkbox'>
          <Checkbox
            color='primary'
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>
        {headCells.map(headCell => (
          <TableCell
            key={headCell.id}
            align={'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}>
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}>
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component='span' sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar(props) {
  const { numSelected } = props;

  return (
    <>
      {numSelected > 0 ? (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...{
              bgcolor: theme =>
                alpha(
                  theme.palette.primary.main,
                  theme.palette.action.activatedOpacity
                ),
            },
          }}>
          <Typography
            sx={{ flex: '1 1 100%' }}
            color='inherit'
            variant='subtitle1'
            component='div'>
            {numSelected} selected
          </Typography>

          <Tooltip title='Delete'>
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      ) : null}
    </>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

export default function AllRecordBooksTable() {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('subject');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [student, setStudent] = React.useState('');
  const [students, setStudents] = React.useState([]);
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    const getUserData = async () => {
      const result = await API.get(`/student`, { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } });
      setStudents(result.data);
    };
    getUserData();
  }, [])

  const handleChangeStudent = event => {
    setStudent(event.target.value);
    const getStudentData = async () => {
      const result = await API.get(`/student/${event.target.value}/record`, { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } });
      setRows(result.data);
    };
    getStudentData();
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = event => {
    if (event.target.checked) {
      const newSelected = rows.map(n => n.date);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, date) => {
    const selectedIndex = selected.indexOf(date);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, date);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = date => selected.indexOf(date) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        sx={{
          width: '100%',
          mb: 2,
          borderRadius: '12px',
          boxShadow: '0px 4px 20px rgba(83, 83, 83, 0.1)',
        }}>
        <Stack sx={{ p: '16px' }}>
          <FormControl fullWidth>
            <InputLabel>Студент</InputLabel>
            <Select
              id='demo-simple-select'
              value={student}
              label='Студент'
              onChange={handleChangeStudent}>
              {students.map((student, index) => (
                <MenuItem key={index} value={student.guid}>
                  {student.last_name} {student.first_name} {student.middle_name} {student.group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <EnhancedTableToolbar numSelected={selected.length} />
        {rows.length > 0 ? (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 750 }} aria-labelledby='tableTitle'>
                <EnhancedTableHead
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={handleSelectAllClick}
                  onRequestSort={handleRequestSort}
                  rowCount={rows.length}
                />
                <TableBody>
                  {stableSort(rows, getComparator(order, orderBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                      const isItemSelected = isSelected(row.exam_date.split('T')[0]);
                      const labelId = `enhanced-table-checkbox-${index}`;

                      return (
                        <TableRow
                          hover
                          onClick={event => handleClick(event, row.exam_date.split('T')[0])}
                          role='checkbox'
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={row.guid}
                          selected={isItemSelected}>
                          <TableCell padding='checkbox'>
                            <Checkbox
                              color='primary'
                              checked={isItemSelected}
                              inputProps={{
                                'aria-labelledby': labelId,
                              }}
                            />
                          </TableCell>
                          <TableCell
                            component='th'
                            id={labelId}
                            scope='row'
                            padding='none'>
                            {row.exam_date.split('T')[0]}
                          </TableCell>
                          <TableCell>{row.name} {row.teacher.last_name} {row.teacher.first_name[0]}.{row.teacher.middle_name[0]}.<br/>{row.teacher.departament} {row.teacher.position}</TableCell>
                          <TableCell>{row.term}</TableCell>
                          <TableCell>{row.exam_type}</TableCell>
                          <TableCell>{row.mark}</TableCell>
                          <TableCell>
                            <IconButton
                              onClick={e => {
                                e.stopPropagation();
                                setAnchorEl(e.currentTarget);
                              }}>
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  {emptyRows > 0 && (
                    <TableRow
                      style={{
                        height: 53 * emptyRows,
                      }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component='div'
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        ) : (<h1>Нет данных</h1>)}
      </Paper>
      <OptionsMenu anchorEl={anchorEl} open={open} handleClose={handleClose} />
    </Box>
  );
}
