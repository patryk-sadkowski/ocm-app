import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import withAuth from "../hoc/withAuth";
import { NEXT_ACTION_PARAM_NAME, NextAction } from "./Repositories";

const Home = () => {
  return (
    <SimpleGrid
      padding={4}
      spacing={4}
      templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
    >
      <CardWithDescription
        cardLink="/repositories"
        cardTitle="Assets export"
        cardDescription="Export assets from specific repository"
      />
      <CardWithDescription
        cardLink="/assets-import"
        cardTitle="Assets import"
        cardDescription="Change existing assets using Excel file"
      />
      <CardWithDescription
        cardLink="/repositories"
        cardTitle="Distributor pages"
        cardDescription="Generate distributor pages using Excel"
        nextAction={NextAction.GENERATE_DISTRIBUTOR_PAGES}
      />
      <CardWithDescription
        cardLink="/repositories"
        cardTitle="Infinity IQ"
        cardDescription="Generate distributor pages using Excel"
        nextAction={NextAction.INFINITY_IQ}
      />
    </SimpleGrid>
  );
};

type CardWithDescriptionProps = {
  cardTitle: string;
  cardDescription: string;
  cardLink: string;
  nextAction?: NextAction;
};

const CardWithDescription = ({
  cardTitle,
  cardDescription,
  cardLink,
  nextAction,
}: CardWithDescriptionProps) => {
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
      }}
    >
      <Link
        to={{
          pathname: cardLink,
          search: nextAction
            ? `?${NEXT_ACTION_PARAM_NAME}=${nextAction}`
            : undefined,
        }}
      >
        <Card>
          <CardHeader>
            <Heading size="md">{cardTitle}</Heading>
          </CardHeader>
          <CardBody>
            <Text>{cardDescription}</Text>
          </CardBody>
        </Card>
      </Link>
    </motion.div>
  );
};

export default withAuth(Home);
