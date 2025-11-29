import React from 'react';
import { Button, Container, Row, Col, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChessKnight,
  faChartLine,
  faBolt,
  faCheckCircle,
  faLightbulb,
} from '@fortawesome/free-solid-svg-icons';

export default class LandingPage extends React.Component {
  render() {
    return (
      <div className="scoutree-landing">
        {/* Hero Section */}
        <section className="hero-section">
          <Container>
            <Row className="align-items-center">
              <Col lg="6">
                <h1 className="display-3 mb-4">
                  <FontAwesomeIcon icon={faChessKnight} className="mr-3" />
                  ScoutTree
                </h1>
                <p className="lead mb-4">
                  Transform any chess username into a comprehensive opponent profile,
                  tactical playbook, and 60-second pre-game checklist.
                </p>
                <p className="mb-4">
                  Built on top of OpeningTree, ScoutTree analyzes your opponent's games,
                  identifies weaknesses, and provides actionable preparation in under 2 minutes.
                </p>
                <div className="mb-4">
                  <Button color="success" size="lg" onClick={() => this.props.onNavigate('/scout')}>
                    Try Free Demo
                  </Button>{' '}
                  <Button color="outline-secondary" size="lg" onClick={() => this.props.onNavigate('/pricing')}>
                    View Pricing
                  </Button>
                </div>
                <div className="supported-platforms">
                  <small className="text-muted">Supports: </small>
                  <img src="/images/lichess-logo.svg" alt="Lichess" height="20" className="ml-2" onError={(e) => e.target.style.display = 'none'} />
                  <span className="ml-2 mr-2">Lichess</span>
                  <img src="/images/chesscom-logo.svg" alt="Chess.com" height="20" onError={(e) => e.target.style.display = 'none'} />
                  <span className="ml-2">Chess.com</span>
                </div>
              </Col>
              <Col lg="6" className="text-center">
                <div className="demo-video-placeholder">
                  <div style={{
                    background: '#f0f0f0',
                    padding: '60px 20px',
                    borderRadius: '8px',
                    border: '2px dashed #ccc'
                  }}>
                    <FontAwesomeIcon icon={faChartLine} size="4x" color="#90EE90" />
                    <p className="mt-3 text-muted">30-second demo video placeholder</p>
                    <p className="text-muted small">Shows: Enter username → Instant report → Pre-game checklist</p>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Features Section */}
        <section className="features-section py-5">
          <Container>
            <h2 className="text-center mb-5">How ScoutTree Works</h2>
            <Row>
              <Col md="4" className="mb-4">
                <Card>
                  <CardBody className="text-center">
                    <FontAwesomeIcon icon={faBolt} size="3x" color="#90EE90" className="mb-3" />
                    <h4>1. Enter Username</h4>
                    <p>
                      Type your opponent's Lichess or Chess.com username.
                      ScoutTree fetches their public games automatically.
                    </p>
                  </CardBody>
                </Card>
              </Col>
              <Col md="4" className="mb-4">
                <Card>
                  <CardBody className="text-center">
                    <FontAwesomeIcon icon={faChartLine} size="3x" color="#90EE90" className="mb-3" />
                    <h4>2. AI Analysis</h4>
                    <p>
                      Stockfish analyzes openings, tactics, endgames, and time management.
                      Identifies patterns and weaknesses with confidence scoring.
                    </p>
                  </CardBody>
                </Card>
              </Col>
              <Col md="4" className="mb-4">
                <Card>
                  <CardBody className="text-center">
                    <FontAwesomeIcon icon={faCheckCircle} size="3x" color="#90EE90" className="mb-3" />
                    <h4>3. Get Your Playbook</h4>
                    <p>
                      Receive a 60-second pre-game checklist, recommended lines,
                      and a 3-position training drill. Ready in under 2 minutes.
                    </p>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>

        {/* What You Get Section */}
        <section className="benefits-section py-5 bg-light">
          <Container>
            <h2 className="text-center mb-5">What's Included in Every Report</h2>
            <Row>
              <Col md="6">
                <ul className="benefit-list">
                  <li><FontAwesomeIcon icon={faCheckCircle} className="text-success mr-2" /> Interactive opening tree with win/loss stats</li>
                  <li><FontAwesomeIcon icon={faCheckCircle} className="text-success mr-2" /> Weakness detection with evidence links</li>
                  <li><FontAwesomeIcon icon={faCheckCircle} className="text-success mr-2" /> Tactical pattern analysis</li>
                  <li><FontAwesomeIcon icon={faCheckCircle} className="text-success mr-2" /> Time management insights</li>
                  <li><FontAwesomeIcon icon={faCheckCircle} className="text-success mr-2" /> Endgame conversion rates</li>
                </ul>
              </Col>
              <Col md="6">
                <ul className="benefit-list">
                  <li><FontAwesomeIcon icon={faLightbulb} className="text-warning mr-2" /> 3 recommended preparation lines</li>
                  <li><FontAwesomeIcon icon={faLightbulb} className="text-warning mr-2" /> 60-90 second pre-game summary</li>
                  <li><FontAwesomeIcon icon={faLightbulb} className="text-warning mr-2" /> 3-position training drill</li>
                  <li><FontAwesomeIcon icon={faLightbulb} className="text-warning mr-2" /> Downloadable JSON report</li>
                  <li><FontAwesomeIcon icon={faLightbulb} className="text-warning mr-2" /> Confidence scoring & sample size</li>
                </ul>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Pricing Section */}
        <section className="pricing-section py-5">
          <Container>
            <h2 className="text-center mb-5">Pricing</h2>
            <Row>
              <Col md="4" className="mb-4">
                <Card>
                  <CardBody className="text-center">
                    <h4>Free</h4>
                    <h2 className="my-3">$0</h2>
                    <p>Try it out</p>
                    <ul className="text-left">
                      <li>3 reports per month</li>
                      <li>Basic analysis</li>
                      <li>No engine depth</li>
                      <li>Community support</li>
                    </ul>
                    <Button color="outline-secondary" block onClick={() => this.props.onNavigate('/scout')}>
                      Get Started
                    </Button>
                  </CardBody>
                </Card>
              </Col>
              <Col md="4" className="mb-4">
                <Card className="border-success">
                  <CardBody className="text-center">
                    <h4>Pro</h4>
                    <h2 className="my-3">$9.99<small>/mo</small></h2>
                    <p>For serious players</p>
                    <ul className="text-left">
                      <li>100 reports per month</li>
                      <li>Full engine analysis</li>
                      <li>Priority processing</li>
                      <li>API access</li>
                      <li>Email support</li>
                    </ul>
                    <Button color="success" block>
                      Upgrade to Pro
                    </Button>
                  </CardBody>
                </Card>
              </Col>
              <Col md="4" className="mb-4">
                <Card>
                  <CardBody className="text-center">
                    <h4>Team</h4>
                    <h2 className="my-3">$49<small>/mo</small></h2>
                    <p>For coaches & clubs</p>
                    <ul className="text-left">
                      <li>500 reports per month</li>
                      <li>Up to 10 members</li>
                      <li>Shared reports</li>
                      <li>Team dashboard</li>
                      <li>Priority support</li>
                    </ul>
                    <Button color="outline-secondary" block>
                      Contact Sales
                    </Button>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>

        <style jsx="true">{`
          .scoutree-landing {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          }

          .hero-section {
            padding: 80px 0;
            background: linear-gradient(135deg, #f5f5f5 0%, #e8f5e9 100%);
          }

          .features-section, .benefits-section, .pricing-section {
            padding: 60px 0;
          }

          .benefit-list {
            list-style: none;
            padding: 0;
          }

          .benefit-list li {
            padding: 10px 0;
            font-size: 16px;
          }

          .supported-platforms {
            margin-top: 20px;
            display: flex;
            align-items: center;
          }

          .demo-video-placeholder {
            margin-top: 20px;
          }

          @media (max-width: 768px) {
            .hero-section {
              padding: 40px 0;
            }

            .display-3 {
              font-size: 2.5rem;
            }
          }
        `}</style>
      </div>
    );
  }
}
