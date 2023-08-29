import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Input,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import withAuth from "../hoc/withAuth";
import { getAllRepos } from "../services/repositories.service";
import { RepositoryI } from "../types/repositories";

export const NEXT_ACTION_PARAM_NAME = "nextAction";

export enum NextAction {
  ASSETS_IMPORT = "/assets-import",
  REPOSITORY_EXPORT = "/repository-export",
  GENERATE_DISTRIBUTOR_PAGES = "/generate-distributor-pages",
  INFINITY_IQ = "/infinity-iq",
}

/**
 * Returns
 */
const nextActionRoute = (searchParams: URLSearchParams) => {
  const nextAction = searchParams.get(NEXT_ACTION_PARAM_NAME);
  if (nextAction === NextAction.GENERATE_DISTRIBUTOR_PAGES) {
    return NextAction.GENERATE_DISTRIBUTOR_PAGES;
  }

  if (nextAction === NextAction.ASSETS_IMPORT) {
    return NextAction.ASSETS_IMPORT;
  }

  if (nextAction === NextAction.INFINITY_IQ) {
    return NextAction.INFINITY_IQ;
  }

  console.log("Next action undefined. You will be redirected to repository export")
  return NextAction.REPOSITORY_EXPORT;
};

const Repositories = () => {
  const [searchParams] = useSearchParams();
  const nextAction = useMemo(
    () => nextActionRoute(searchParams),
    [searchParams]
  );

  console.log("NEXT ACTION", nextAction);

  const [repositoryNameQuery, setRepositoryNameQuery] = useState("");
  const [repositoryIdQuery, setRepositoryIdQuery] = useState("");
  const [loadingRepositories, setLoadingRepositories] = useState(false);
  const [repositories, setRepositories] = useState<RepositoryI[]>([]);
  const navigate = useNavigate();

  const getRepositories = useCallback(async () => {
    setLoadingRepositories(true);
    const reposRes = await getAllRepos();
    setRepositories(reposRes);
    setLoadingRepositories(false);
  }, []);

  useEffect(() => {
    if (!loadingRepositories && repositories.length < 1) {
      getRepositories();
    }
  }, [getRepositories, loadingRepositories, repositories.length]);

  return (
    <Box>
      <Box padding={4}>
        <Card>
          <CardBody>
            <Heading size="sm" marginBottom={4}>
              {nextAction === NextAction.GENERATE_DISTRIBUTOR_PAGES && <span>Generate distributor pages</span>}
              {nextAction === NextAction.REPOSITORY_EXPORT && <span>Export repository</span>}
            </Heading>
            <Text> Choose the repository you want to work with</Text>
          </CardBody>
        </Card>
      </Box>
      <TableContainer opacity={loadingRepositories ? 0.5 : 1}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th isNumeric>#</Th>
              <Th>Repository</Th>
              <Th>ID</Th>
            </Tr>
            <Tr>
              <Th>-</Th>
              <Th>
                <Input
                  value={repositoryNameQuery}
                  onChange={(e) => setRepositoryNameQuery(e.target.value)}
                  placeholder="Repository name"
                  size="xs"
                />
              </Th>
              <Th>
                <Input
                  value={repositoryIdQuery}
                  onChange={(e) => setRepositoryIdQuery(e.target.value)}
                  placeholder="Repository id"
                  size="xs"
                />
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {loadingRepositories && (
              <Tr>
                <Td>
                  <Skeleton>1</Skeleton>
                </Td>
                <Td>
                  <Skeleton>1</Skeleton>
                </Td>
                <Td>
                  <Skeleton>1</Skeleton>
                </Td>
              </Tr>
            )}

            {repositories
              .filter(
                (repo) =>
                  repo.name
                    .toLowerCase()
                    .includes(repositoryNameQuery.toLowerCase()) &&
                  repo.id
                    .toLowerCase()
                    .includes(repositoryIdQuery.toLowerCase())
              )
              .map((repo, i) => {
                return (
                  <Tr
                    key={i}
                    cursor="pointer"
                    _hover={{
                      color: "blue.500",
                    }}
                    onClick={() => {
                      navigate({
                        pathname: nextAction,
                        search: `?id=${repo.id}&name=${repo.name}`,
                      });
                    }}
                  >
                    <Td>{i}</Td>
                    <Td>{repo.name}</Td>
                    <Td>{repo.id}</Td>
                  </Tr>
                );
              })}
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>#</Th>
              <Th>Repository</Th>
              <Th isNumeric>ID</Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default withAuth(Repositories);
