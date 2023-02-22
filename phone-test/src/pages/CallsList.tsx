import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import { PAGINATED_CALLS } from '../gql/queries';
import {
  Grid,
  Icon,
  Typography,
  Spacer,
  Box,
  DiagonalDownOutlined,
  DiagonalUpOutlined,
  Pagination,
  Menu,
  Dropdown,
  PreferencesOutlined,
  DropdownButton,
  MenuItemGroup
} from '@aircall/tractor';
import { formatDate, formatDuration } from '../helpers/dates';
import { useNavigate, useSearchParams } from 'react-router-dom';
import React from 'react';
import { MenuItemRoot } from '@aircall/tractor/es/components/Menu/components';

export const PaginationWrapper = styled.div`
  > div {
    width: inherit;
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
`;

export const CallsListPage = () => {
  const [callFilter, setCallFilter] = React.useState('all')
  const [pageSize, setPageSize] = React.useState(5);
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const pageQueryParams = search.get('page');
  const activePage = !!pageQueryParams ? parseInt(pageQueryParams) : 1;
  const { loading, error, data } = useQuery(PAGINATED_CALLS, {
    variables: {
      offset: (activePage - 1) * pageSize,
      limit: pageSize
    }
    // onCompleted: () => handleRefreshToken(),
  });

  if (loading) return <p>Loading calls...</p>;
  if (error) return <p>ERROR</p>;
  if (!data) return <p>Not found</p>;

  const { totalCount, nodes: calls } = data.paginatedCalls;

  const handleCallOnClick = (callId: string) => {
    navigate(`/calls/${callId}`);
  };

  const handlePageChange = (page: number) => {
    navigate(`/calls/?page=${page}`);
  };

  const handlePageSize = (pageSize: number) => {
    setPageSize(pageSize);
  }

  const handleFilter = (callDirection: any) => {
    setCallFilter(callDirection);
  }



  return (
    <>
      <Typography variant="displayM" textAlign="center" py={3}>
        Calls History
      </Typography>
      <Spacer space="s" justifyItems="center" alignItems="center">
        <Dropdown trigger={<DropdownButton mode="link" variant="primary" iconClose={<PreferencesOutlined />}>
          Filters
        </DropdownButton>}>
          <Menu>
            <MenuItemGroup>
              <MenuItemRoot onClick={handleFilter} itemKey={'all'}>All</MenuItemRoot>
              <MenuItemRoot onClick={handleFilter} itemKey={'inbound'}>Inbound</MenuItemRoot>
              <MenuItemRoot onClick={handleFilter} itemKey={'outbound'}>Outbound</MenuItemRoot>
            </MenuItemGroup>
          </Menu>
        </Dropdown>
      </Spacer>
      <Spacer space={3} direction="vertical">
        {calls
          .filter((call: Call) => call.direction === callFilter ? true : callFilter === 'all')
          .map((call: Call) => {
            const icon = call.direction === 'inbound' ? DiagonalDownOutlined : DiagonalUpOutlined;
            const title =
              call.call_type === 'missed'
                ? 'Missed call'
                : call.call_type === 'answered'
                  ? 'Call answered'
                  : 'Voicemail';
            const subtitle = call.direction === 'inbound' ? `from ${call.from}` : `to ${call.to}`;
            const duration = formatDuration(call.duration / 1000);
            const date = formatDate(call.created_at);
            const notes = call.notes ? `Call has ${call.notes.length} notes` : <></>;

            return (
              <Box
                key={call.id}
                bg="black-a30"
                borderRadius={16}
                cursor="pointer"
                onClick={() => handleCallOnClick(call.id)}
              >
                <Grid
                  gridTemplateColumns="32px 1fr max-content"
                  columnGap={2}
                  borderBottom="1px solid"
                  borderBottomColor="neutral-700"
                  alignItems="center"
                  px={4}
                  py={2}
                >
                  <Box>
                    <Icon component={icon} size={32} />
                  </Box>
                  <Box>
                    <Typography variant="body">{title}</Typography>
                    <Typography variant="body2">{subtitle}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" textAlign="right">
                      {duration}
                    </Typography>
                    <Typography variant="caption">{date}</Typography>
                  </Box>
                </Grid>
                <Box px={4} py={2}>
                  <Typography variant="caption">{notes}</Typography>
                </Box>
              </Box>
            );
          })}
      </Spacer>

      {totalCount && (
        <PaginationWrapper>
          <Pagination
            activePage={activePage}
            pageSize={pageSize}
            onPageSizeChange={handlePageSize}
            onPageChange={handlePageChange}
            recordsTotalCount={totalCount}
          />
        </PaginationWrapper>
      )}
    </>
  );
};
