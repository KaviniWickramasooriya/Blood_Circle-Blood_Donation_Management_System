import React from 'react';
import { Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CounterCard.css';

function CounterCard({ title, count }) {
  return (
    <Card className="counter-card mb-3">
      <Card.Header className="bg-red text-white">{title}</Card.Header>
      <Card.Body>
        <Card.Title className="text-center display-4">{count}</Card.Title>
        <Card.Text className="text-center">Units Available</Card.Text>
      </Card.Body>
    </Card>
  );
}

export default CounterCard;