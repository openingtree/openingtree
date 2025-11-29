import React from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Badge,
  Collapse,
  Alert,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faChevronDown,
  faChevronRight,
  faCopy,
  faExclamationTriangle,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import scoutTreeAPI from '../api/client';

export default class ReportPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      report: null,
      loading: true,
      error: null,
      expandedNodes: {},
      copiedText: null,
    };
  }

  async componentDidMount() {
    await this.loadReport();
  }

  async loadReport() {
    try {
      const reportId = this.props.reportId;
      const result = await scoutTreeAPI.downloadReport(reportId);

      this.setState({
        report: result.data,
        loading: false,
      });
    } catch (error) {
      this.setState({
        error: error.message,
        loading: false,
      });
    }
  }

  toggleNode = (nodeId) => {
    this.setState({
      expandedNodes: {
        ...this.state.expandedNodes,
        [nodeId]: !this.state.expandedNodes[nodeId],
      },
    });
  };

  copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    this.setState({ copiedText: text });
    setTimeout(() => this.setState({ copiedText: null }), 2000);
  };

  downloadJSON = () => {
    const blob = new Blob([JSON.stringify(this.state.report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scout-report-${this.state.report.player_profile.username}.json`;
    a.click();
  };

  renderConfidenceBadge = (confidence) => {
    const colors = {
      high: 'success',
      medium: 'warning',
      low: 'secondary',
    };

    return (
      <Badge color={colors[confidence] || 'secondary'} className="ml-2">
        {confidence} confidence
      </Badge>
    );
  };

  renderSeverityBadge = (severity) => {
    const colors = {
      critical: 'danger',
      high: 'warning',
      medium: 'info',
      low: 'secondary',
    };

    return (
      <Badge color={colors[severity] || 'secondary'}>
        {severity}
      </Badge>
    );
  };

  renderOpeningNode = (node, depth = 0, parentId = '') => {
    const nodeId = `${parentId}-${node.move}`;
    const isExpanded = this.state.expandedNodes[nodeId];
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={nodeId} style={{ marginLeft: `${depth * 20}px` }} className="opening-node">
        <div className="d-flex align-items-center mb-2">
          {hasChildren && (
            <FontAwesomeIcon
              icon={isExpanded ? faChevronDown : faChevronRight}
              className="mr-2 cursor-pointer"
              onClick={() => this.toggleNode(nodeId)}
            />
          )}
          <span className="move-san" style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
            {node.move}
          </span>
          <span className="ml-2 text-muted">
            {node.frequency_pct.toFixed(1)}% ({node.frequency} games)
          </span>
          <span className="ml-3">
            <span className="text-success">{node.white_win_pct.toFixed(0)}%</span>
            {' / '}
            <span className="text-muted">{node.draw_pct.toFixed(0)}%</span>
            {' / '}
            <span className="text-danger">{node.black_win_pct.toFixed(0)}%</span>
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => this.renderOpeningNode(child, depth + 1, nodeId))}
          </div>
        )}
      </div>
    );
  };

  render() {
    const { report, loading, error } = this.state;

    if (loading) {
      return (
        <Container className="text-center py-5">
          <h3>Loading report...</h3>
        </Container>
      );
    }

    if (error) {
      return (
        <Container className="py-5">
          <Alert color="danger">{error}</Alert>
        </Container>
      );
    }

    if (!report) {
      return null;
    }

    return (
      <Container fluid className="report-page py-4">
        <Row>
          {/* Left Column: Summary and Checklist */}
          <Col lg="4" className="mb-4">
            <Card className="sticky-top" style={{ top: '20px' }}>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4>Pre-Game Checklist</h4>
                  <Button size="sm" color="success" onClick={this.downloadJSON}>
                    <FontAwesomeIcon icon={faDownload} />
                  </Button>
                </div>

                <div className="player-info mb-4">
                  <h5>{report.player_profile.username}</h5>
                  <div className="text-muted">
                    <small>{report.player_profile.platform}</small>
                    {report.player_profile.rating && (
                      <span className="ml-2">• {report.player_profile.rating}</span>
                    )}
                  </div>
                  <div className="text-muted">
                    <small>{report.player_profile.total_games_analyzed} games analyzed</small>
                  </div>
                </div>

                <div className="checklist-summary mb-4">
                  <h6>60-Second Summary</h6>
                  <p className="summary-text">{report.pregame_checklist.summary}</p>
                </div>

                <div className="key-points mb-4">
                  <h6>Key Points</h6>
                  <ul>
                    {report.pregame_checklist.key_points.map((point, idx) => (
                      <li key={idx}>
                        <FontAwesomeIcon icon={faCheckCircle} className="text-success mr-2" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="avoid-list mb-4">
                  <h6>
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning mr-2" />
                    What to Avoid
                  </h6>
                  <ul>
                    {report.pregame_checklist.avoid_list.map((item, idx) => (
                      <li key={idx} className="text-muted">{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="priority-prep">
                  <Alert color="info">
                    <strong>Priority Prep:</strong> {report.pregame_checklist.priority_prep}
                  </Alert>
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Right Column: Detailed Analysis */}
          <Col lg="8">
            {/* Opening Tree */}
            <Card className="mb-4">
              <CardBody>
                <h4 className="mb-3">Opening Tree</h4>
                <div className="opening-tree">
                  {report.opening_tree.root_positions.map(node =>
                    this.renderOpeningNode(node)
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Weaknesses */}
            <Card className="mb-4">
              <CardBody>
                <h4 className="mb-3">Weaknesses & Patterns</h4>
                {report.weaknesses.map((weakness, idx) => (
                  <Card key={idx} className="mb-3 border-left-4" style={{ borderLeftColor: '#f39c12', borderLeftWidth: '4px' }}>
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-start">
                        <h6>
                          {weakness.description}
                          {this.renderConfidenceBadge(weakness.confidence)}
                        </h6>
                        {this.renderSeverityBadge(weakness.severity)}
                      </div>

                      <div className="mt-2">
                        <small className="text-muted">
                          Category: {weakness.category} • Occurrence: {weakness.occurrence_rate.toFixed(1)}%
                          • Sample: {weakness.sample_size} games
                        </small>
                      </div>

                      {weakness.evidence.length > 0 && (
                        <div className="mt-3">
                          <strong>Evidence:</strong>
                          <ul className="mt-2">
                            {weakness.evidence.map((ev, evIdx) => (
                              <li key={evIdx}>
                                {ev.description}
                                {ev.game_url && (
                                  <a href={ev.game_url} target="_blank" rel="noopener noreferrer" className="ml-2">
                                    View game
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </CardBody>
            </Card>

            {/* Recommended Lines */}
            <Card className="mb-4">
              <CardBody>
                <h4 className="mb-3">Recommended Preparation Lines</h4>
                {report.recommended_lines.map((line, idx) => (
                  <Card key={idx} className="mb-3">
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-start">
                        <h6>
                          {line.name}
                          <Badge color="primary" className="ml-2">{line.type}</Badge>
                          {this.renderConfidenceBadge(line.confidence)}
                        </h6>
                        <Button
                          size="sm"
                          color="outline-secondary"
                          onClick={() => this.copyToClipboard(line.moves)}
                        >
                          <FontAwesomeIcon icon={faCopy} className="mr-1" />
                          {this.state.copiedText === line.moves ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>

                      <div className="mt-2" style={{ fontFamily: 'monospace', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                        {line.moves}
                      </div>

                      <p className="mt-3 mb-2">{line.explanation}</p>

                      <div className="mt-2">
                        <strong>Follow-up plan:</strong> {line.follow_up_plan}
                      </div>

                      {line.success_rate !== null && (
                        <div className="mt-2 text-success">
                          <small>Historical success rate: {line.success_rate.toFixed(1)}%</small>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </CardBody>
            </Card>

            {/* Training Drill */}
            <Card className="mb-4">
              <CardBody>
                <h4 className="mb-3">{report.training_drill.title}</h4>
                <p className="text-muted">{report.training_drill.description}</p>

                {report.training_drill.positions.map((position, idx) => (
                  <Card key={idx} className="mb-3 bg-light">
                    <CardBody>
                      <div className="d-flex justify-content-between">
                        <h6>Position {idx + 1}</h6>
                        <Badge color="info">{position.difficulty}</Badge>
                      </div>
                      <div className="mt-2">
                        <strong>Question:</strong> {position.question}
                      </div>
                      <div className="mt-2 text-muted">
                        <strong>Answer:</strong> {position.answer}
                      </div>
                      <div className="mt-2" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                        FEN: {position.fen}
                      </div>
                    </CardBody>
                  </Card>
                ))}

                <Alert color="warning">
                  <small>
                    <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                    Time limit: {report.training_drill.time_limit_seconds} seconds total
                  </small>
                </Alert>
              </CardBody>
            </Card>

            {/* Data Limitations */}
            {report.data_limitations.warnings.length > 0 && (
              <Card>
                <CardBody>
                  <h6>Data Limitations</h6>
                  {report.data_limitations.warnings.map((warning, idx) => (
                    <Alert color="warning" key={idx}>
                      <small>{warning}</small>
                    </Alert>
                  ))}
                </CardBody>
              </Card>
            )}
          </Col>
        </Row>

        <style jsx="true">{`
          .report-page {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .opening-node {
            padding: 4px 0;
            cursor: pointer;
          }

          .opening-node:hover {
            background: #f9f9f9;
          }

          .move-san {
            min-width: 60px;
          }

          .summary-text {
            line-height: 1.6;
            font-size: 15px;
          }

          .cursor-pointer {
            cursor: pointer;
          }

          @media print {
            .sticky-top {
              position: relative !important;
            }
          }
        `}</style>
      </Container>
    );
  }
}
