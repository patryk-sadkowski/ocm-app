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

const Home = () => {
  return (
    <SimpleGrid
      padding={4}
      spacing={4}
      templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
    >
      <CardWithDescription
        cardLink="/assets"
        cardTitle="Assets export"
        cardDescription="Export assets from specific repository"
      />
      <CardWithDescription
        cardLink="/assets-import"
        cardTitle="Assets import"
        cardDescription="Change existing assets using Excel file"
      />
    </SimpleGrid>
  );
};

type CardWithDescriptionProps = {
  cardTitle: string;
  cardDescription: string;
  cardLink: string;
};

const CardWithDescription = (props: CardWithDescriptionProps) => {
  const { cardTitle, cardDescription, cardLink } = props;
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
      }}
    >
      <Link to={cardLink}>
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
