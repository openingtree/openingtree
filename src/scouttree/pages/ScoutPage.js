import React from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Progress,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import scoutTreeAPI from '../api/client';

export default class ScoutPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      platform: 'auto',
      color: 'both',
      timeControl: 'all',
      maxGames: 500,
      includeEngineAnalysis: true,

      loading: false,
      progress: 0,
      error: null,
      reportId: null,
      jobId: null,
      pollingInterval: null,
    };
  }

  componentWillUnmount() {
    if (this.state.pollingInterval) {
      clearInterval(this.state.pollingInterval);
    }
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ loading: true, error: null, progress: 0 });

    try {
      const result = await scoutTreeAPI.createScoutReport({
        username: this.state.username,
        platform: this.state.platform,
        color: this.state.color,
        time_control: this.state.timeControl === 'all' ? null : this.state.timeControl,
        max_games: this.state.maxGames,
        include_engine_analysis: this.state.includeEngineAnalysis,
      });

      if (result.data.status === 'completed') {
        // Cache hit - instant result
        this.props.onReportReady(result.data.report_id);
      } else {
        // Job queued - start polling
        this.setState({
          jobId: result.data.job_id,
          reportId: result.data.report_id,
        });
        this.startPolling(result.data.job_id);
      }
    } catch (error) {
      this.setState({
        loading: false,
        error: error.message || 'Failed to create scout report',
      });
    }
  };

  startPolling = (jobId) => {
    const interval = setInterval(async () => {
      try {
        const result = await scoutTreeAPI.getScoutReport(jobId);

        if (result.data.status === 'completed') {
          clearInterval(interval);
          this.setState({ loading: false, progress: 100 });
          this.props.onReportReady(result.data.report_id);
        } else if (result.data.status === 'failed') {
          clearInterval(interval);
          this.setState({
            loading: false,
            error: result.data.error || 'Report generation failed',
          });
        } else {
          // Update progress
          this.setState({
            progress: Math.min(this.state.progress + 5, 90),
          });
        }
      } catch (error) {
        clearInterval(interval);
        this.setState({
          loading: false,
          error: 'Failed to check report status',
        });
      }
    }, 2000); // Poll every 2 seconds

    this.setState({ pollingInterval: interval });
  };

  render() {
    return (
      <Container className="scout-page py-5">
        <Row>
          <Col lg="8" className="mx-auto">
            <Card>
              <CardBody>
                <h2 className="mb-4">
                  <FontAwesomeIcon icon={faSearch} className="mr-2" />
                  Scout an Opponent
                </h2>

                <p className="text-muted mb-4">
                  Enter your opponent's username to generate a comprehensive scouting report
                  with opening analysis, weaknesses, and preparation recommendations.
                </p>

                {this.state.error && (
                  <Alert color="danger">{this.state.error}</Alert>
                )}

                <Form onSubmit={this.handleSubmit}>
                  <FormGroup>
                    <Label for="username">Opponent Username *</Label>
                    <Input
                      type="text"
                      id="username"
                      value={this.state.username}
                      onChange={(e) => this.setState({ username: e.target.value })}
                      placeholder="e.g., DrNykterstein"
                      required
                      disabled={this.state.loading}
                    />
                    <small className="text-muted">
                      From Lichess, Chess.com, or let us auto-detect
                    </small>
                  </FormGroup>

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="platform">Platform</Label>
                        <Input
                          type="select"
                          id="platform"
                          value={this.state.platform}
                          onChange={(e) => this.setState({ platform: e.target.value })}
                          disabled={this.state.loading}
                        >
                          <option value="auto">Auto-detect</option>
                          <option value="lichess">Lichess</option>
                          <option value="chess.com">Chess.com</option>
                        </Input>
                      </FormGroup>
                    </Col>

                    <Col md="6">
                      <FormGroup>
                        <Label for="color">Your Color</Label>
                        <Input
                          type="select"
                          id="color"
                          value={this.state.color}
                          onChange={(e) => this.setState({ color: e.target.value })}
                          disabled={this.state.loading}
                        >
                          <option value="both">Both (recommended)</option>
                          <option value="white">White only</option>
                          <option value="black">Black only</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="timeControl">Time Control</Label>
                        <Input
                          type="select"
                          id="timeControl"
                          value={this.state.timeControl}
                          onChange={(e) => this.setState({ timeControl: e.target.value })}
                          disabled={this.state.loading}
                        >
                          <option value="all">All time controls</option>
                          <option value="bullet">Bullet</option>
                          <option value="blitz">Blitz</option>
                          <option value="rapid">Rapid</option>
                          <option value="classical">Classical</option>
                        </Input>
                      </FormGroup>
                    </Col>

                    <Col md="6">
                      <FormGroup>
                        <Label for="maxGames">Max Games to Analyze</Label>
                        <Input
                          type="number"
                          id="maxGames"
                          value={this.state.maxGames}
                          onChange={(e) => this.setState({ maxGames: parseInt(e.target.value) })}
                          min="10"
                          max="1000"
                          disabled={this.state.loading}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <FormGroup check className="mb-4">
                    <Label check>
                      <Input
                        type="checkbox"
                        checked={this.state.includeEngineAnalysis}
                        onChange={(e) => this.setState({ includeEngineAnalysis: e.target.checked })}
                        disabled={this.state.loading}
                      />{' '}
                      Include Stockfish engine analysis (Pro feature)
                    </Label>
                  </FormGroup>

                  {this.state.loading && (
                    <div className="mb-4">
                      <div className="d-flex justify-content-between mb-2">
                        <span>
                          <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                          Generating report...
                        </span>
                        <span>{this.state.progress}%</span>
                      </div>
                      <Progress value={this.state.progress} color="success" />
                      <small className="text-muted mt-2 d-block">
                        {this.state.progress < 30 && 'Fetching games...'}
                        {this.state.progress >= 30 && this.state.progress < 60 && 'Building opening tree...'}
                        {this.state.progress >= 60 && this.state.progress < 85 && 'Analyzing patterns...'}
                        {this.state.progress >= 85 && 'Finalizing report...'}
                      </small>
                    </div>
                  )}

                  <div className="d-flex justify-content-between">
                    <Button
                      color="success"
                      type="submit"
                      disabled={this.state.loading || !this.state.username}
                      size="lg"
                    >
                      {this.state.loading ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSearch} className="mr-2" />
                          Generate Report
                        </>
                      )}
                    </Button>

                    <Button
                      color="outline-secondary"
                      onClick={() => this.props.onNavigate('/demo')}
                      disabled={this.state.loading}
                    >
                      View Demo Report
                    </Button>
                  </div>
                </Form>

                <hr className="my-4" />

                <div className="text-muted">
                  <h6>What happens next?</h6>
                  <ul>
                    <li>We fetch public games from the selected platform</li>
                    <li>Stockfish analyzes key positions and patterns</li>
                    <li>You get a comprehensive report in 1-2 minutes</li>
                    <li>Includes opening tree, weaknesses, and prep recommendations</li>
                  </ul>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <style jsx="true">{`
          .scout-page {
            min-height: 80vh;
          }
        `}</style>
      </Container>
    );
  }
}
