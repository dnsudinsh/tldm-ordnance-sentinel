"""
Enhanced Export Service for Forecasting Reports
Supports PDF and Excel export with professional formatting
"""
import json
import os
import logging
from typing import Dict, Any, List
from datetime import datetime
from io import BytesIO
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.platypus.flowables import PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

from models.forecasting import ForecastResult

logger = logging.getLogger(__name__)


class ForecastExportService:
    """Service for exporting forecast reports in various formats"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom report styles"""
        # TLDM Header Style
        self.styles.add(ParagraphStyle(
            name='TLDMHeader',
            parent=self.styles['Title'],
            fontSize=18,
            spaceAfter=30,
            textColor=colors.HexColor('#1f2937'),
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Section Header Style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading1'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.HexColor('#374151'),
            fontName='Helvetica-Bold'
        ))
        
        # Military Classification Style
        self.styles.add(ParagraphStyle(
            name='Classification',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.red,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))

    async def export_forecast_pdf(self, forecast: ForecastResult) -> bytes:
        """Export forecast as PDF report"""
        try:
            buffer = BytesIO()
            doc = SimpleDocTemplate(
                buffer,
                pagesize=A4,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=18
            )
            
            # Build PDF content
            story = []
            
            # Classification header
            story.append(Paragraph("OFFICIAL USE ONLY", self.styles['Classification']))
            story.append(Spacer(1, 12))
            
            # Report header
            story.append(Paragraph(
                "TENTERA LAUT DIRAJA MALAYSIA<br/>READINESS FORECAST REPORT",
                self.styles['TLDMHeader']
            ))
            story.append(Spacer(1, 20))
            
            # Report metadata
            metadata_data = [
                ['Forecast ID:', forecast.forecast_id],
                ['Generated:', forecast.generated_at.strftime('%Y-%m-%d %H:%M:%S UTC')],
                ['Current Readiness:', f"{forecast.timeframe.current_readiness:.1f}%"],
                ['Confidence:', f"{forecast.confidence_metrics.model_accuracy * 100:.0f}%"],
                ['Classification:', 'OFFICIAL USE ONLY']
            ]
            
            metadata_table = Table(metadata_data, colWidths=[2*inch, 3*inch])
            metadata_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f9fafb')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
                ('ALIGN', (1, 0), (1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb'))
            ]))
            story.append(metadata_table)
            story.append(Spacer(1, 20))
            
            # Executive Summary
            story.append(Paragraph("EXECUTIVE SUMMARY", self.styles['SectionHeader']))
            
            # Readiness projections summary
            projections_summary = self._generate_projections_summary(forecast)
            story.append(Paragraph(projections_summary, self.styles['Normal']))
            story.append(Spacer(1, 15))
            
            # Readiness Projections Table
            story.append(Paragraph("READINESS PROJECTIONS", self.styles['SectionHeader']))
            
            projection_data = [['Timeframe', 'Projected Readiness', 'Confidence Interval', 'Risk Level']]
            projection_data.append(['Current', f"{forecast.timeframe.current_readiness:.1f}%", 'N/A', 'Baseline'])
            
            for proj in forecast.timeframe.projections:
                confidence_range = f"{proj.confidence_interval[0]:.1f}% - {proj.confidence_interval[1]:.1f}%"
                projection_data.append([
                    f"{proj.days} days",
                    f"{proj.readiness:.1f}%",
                    confidence_range,
                    proj.risk_level.upper()
                ])
            
            projections_table = Table(projection_data, colWidths=[1.2*inch, 1.3*inch, 1.8*inch, 1.2*inch])
            projections_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f2937')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f9fafb')),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb'))
            ]))
            story.append(projections_table)
            story.append(Spacer(1, 20))
            
            # Critical Alerts
            if forecast.critical_alerts:
                story.append(Paragraph("CRITICAL ALERTS", self.styles['SectionHeader']))
                
                alert_data = [['Category', 'Expected Shortage', 'Severity', 'Current Stock', 'Projected Need']]
                for alert in forecast.critical_alerts:
                    alert_data.append([
                        alert.category,
                        alert.expected_shortage_date,
                        alert.severity.upper(),
                        str(alert.current_stock_level),
                        str(alert.projected_need)
                    ])
                
                alerts_table = Table(alert_data, colWidths=[1.2*inch, 1.2*inch, 0.8*inch, 0.9*inch, 1.0*inch])
                alerts_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dc2626')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 8),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#fef2f2')),
                    ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#fca5a5'))
                ]))
                story.append(alerts_table)
                story.append(Spacer(1, 20))
            
            # Procurement Recommendations
            if forecast.procurement_recommendations:
                story.append(Paragraph("PROCUREMENT RECOMMENDATIONS", self.styles['SectionHeader']))
                
                proc_data = [['Priority', 'Category', 'Quantity', 'Deadline', 'Lead Time']]
                for rec in forecast.procurement_recommendations:
                    proc_data.append([
                        rec.priority.upper(),
                        rec.category,
                        f"{rec.recommended_quantity:,}",
                        rec.deadline,
                        f"{rec.supplier_lead_time} days"
                    ])
                
                proc_table = Table(proc_data, colWidths=[0.8*inch, 1.5*inch, 1.0*inch, 1.0*inch, 0.9*inch])
                proc_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#059669')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 8),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f0fdf4')),
                    ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#86efac'))
                ]))
                story.append(proc_table)
                story.append(Spacer(1, 20))
            
            # Confidence Metrics
            story.append(Paragraph("FORECAST RELIABILITY", self.styles['SectionHeader']))
            confidence_data = [
                ['Model Accuracy', f"{forecast.confidence_metrics.model_accuracy * 100:.1f}%"],
                ['Data Quality Score', f"{forecast.confidence_metrics.data_quality_score * 100:.1f}%"],
                ['Forecast Reliability', forecast.confidence_metrics.forecast_reliability.upper()],
                ['Generation Method', forecast.metadata.get('generated_as', 'Unknown').replace('_', ' ').title()]
            ]
            
            confidence_table = Table(confidence_data, colWidths=[2.5*inch, 2*inch])
            confidence_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f3f4f6')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
                ('ALIGN', (1, 0), (1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#d1d5db'))
            ]))
            story.append(confidence_table)
            story.append(Spacer(1, 30))
            
            # Footer
            story.append(Paragraph(
                "This report is generated by the BITS Predictive Forecasting System for operational planning purposes. "
                "All projections are estimates based on historical data and current trends. "
                "Actual results may vary due to operational requirements and external factors.",
                self.styles['Normal']
            ))
            
            # Build PDF
            doc.build(story)
            buffer.seek(0)
            return buffer.read()
            
        except Exception as e:
            logger.error(f"Failed to generate PDF report: {e}")
            raise

    async def export_forecast_excel(self, forecast: ForecastResult) -> bytes:
        """Export forecast as Excel workbook"""
        try:
            buffer = BytesIO()
            
            with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
                # Summary Sheet
                summary_data = {
                    'Metric': [
                        'Forecast ID',
                        'Generated At',
                        'Current Readiness',
                        'Model Accuracy', 
                        'Data Quality Score',
                        'Reliability'
                    ],
                    'Value': [
                        forecast.forecast_id,
                        forecast.generated_at.strftime('%Y-%m-%d %H:%M:%S'),
                        f"{forecast.timeframe.current_readiness:.1f}%",
                        f"{forecast.confidence_metrics.model_accuracy * 100:.1f}%",
                        f"{forecast.confidence_metrics.data_quality_score * 100:.1f}%",
                        forecast.confidence_metrics.forecast_reliability.title()
                    ]
                }
                
                summary_df = pd.DataFrame(summary_data)
                summary_df.to_excel(writer, sheet_name='Summary', index=False)
                
                # Projections Sheet
                projections_data = []
                projections_data.append({
                    'Timeframe': 'Current',
                    'Days': 0,
                    'Readiness (%)': forecast.timeframe.current_readiness,
                    'Lower Bound (%)': forecast.timeframe.current_readiness,
                    'Upper Bound (%)': forecast.timeframe.current_readiness,
                    'Risk Level': 'Baseline'
                })
                
                for proj in forecast.timeframe.projections:
                    projections_data.append({
                        'Timeframe': f"{proj.days} days",
                        'Days': proj.days,
                        'Readiness (%)': proj.readiness,
                        'Lower Bound (%)': proj.confidence_interval[0],
                        'Upper Bound (%)': proj.confidence_interval[1],
                        'Risk Level': proj.risk_level.title()
                    })
                
                projections_df = pd.DataFrame(projections_data)
                projections_df.to_excel(writer, sheet_name='Projections', index=False)
                
                # Alerts Sheet
                if forecast.critical_alerts:
                    alerts_data = []
                    for alert in forecast.critical_alerts:
                        alerts_data.append({
                            'Category': alert.category,
                            'Expected Shortage Date': alert.expected_shortage_date,
                            'Severity': alert.severity.title(),
                            'Current Stock Level': alert.current_stock_level,
                            'Projected Need': alert.projected_need,
                            'Impacted Operations': ', '.join(alert.impacted_operations)
                        })
                    
                    alerts_df = pd.DataFrame(alerts_data)
                    alerts_df.to_excel(writer, sheet_name='Critical Alerts', index=False)
                
                # Procurement Sheet
                if forecast.procurement_recommendations:
                    proc_data = []
                    for rec in forecast.procurement_recommendations:
                        proc_data.append({
                            'Priority': rec.priority.title(),
                            'Category': rec.category,
                            'Recommended Quantity': rec.recommended_quantity,
                            'Deadline': rec.deadline,
                            'Supplier Lead Time (Days)': rec.supplier_lead_time,
                            'Rationale': rec.rationale
                        })
                    
                    proc_df = pd.DataFrame(proc_data)
                    proc_df.to_excel(writer, sheet_name='Procurement', index=False)
                
                # Mitigation Strategies Sheet
                if forecast.mitigation_strategies:
                    mitigation_data = []
                    for strategy in forecast.mitigation_strategies:
                        mitigation_data.append({
                            'Strategy': strategy.strategy,
                            'Effectiveness (%)': strategy.effectiveness * 100,
                            'Implementation Time (Days)': strategy.implementation_time,
                            'Impact': strategy.impact,
                            'Items Affected': ', '.join(strategy.items_affected)
                        })
                    
                    mitigation_df = pd.DataFrame(mitigation_data)
                    mitigation_df.to_excel(writer, sheet_name='Mitigation Strategies', index=False)
            
            buffer.seek(0)
            return buffer.read()
            
        except Exception as e:
            logger.error(f"Failed to generate Excel report: {e}")
            raise

    def _generate_projections_summary(self, forecast: ForecastResult) -> str:
        """Generate executive summary of projections"""
        current = forecast.timeframe.current_readiness
        
        if forecast.timeframe.projections:
            final_projection = forecast.timeframe.projections[-1]
            change = final_projection.readiness - current
            
            if change > 0:
                trend = f"improve by {change:.1f}%"
            elif change < 0:
                trend = f"decline by {abs(change):.1f}%"
            else:
                trend = "remain stable"
            
            summary = f"""
            Current readiness stands at {current:.1f}%. Over the next {final_projection.days} days, 
            projections indicate readiness levels will {trend}, reaching {final_projection.readiness:.1f}% 
            with a {final_projection.risk_level} risk assessment.
            
            The forecast shows {len(forecast.critical_alerts)} critical alert(s) and 
            {len(forecast.procurement_recommendations)} procurement recommendation(s) requiring immediate attention.
            Model confidence is {forecast.confidence_metrics.model_accuracy * 100:.0f}% with 
            {forecast.confidence_metrics.forecast_reliability} reliability.
            """
        else:
            summary = f"""
            Current readiness stands at {current:.1f}%. Insufficient projection data available 
            for detailed forecasting. {len(forecast.critical_alerts)} critical alert(s) identified.
            """
        
        return summary.strip()