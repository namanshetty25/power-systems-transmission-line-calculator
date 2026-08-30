% Transmission Line Parameter Calculator
% This program calculates total resistance, inductance and capacitance of a transmission line
clear;
clc;

% Select whether the conductor is single strand or multiple strands
fprintf('Are the conductors with single strand or multiple strands?\n');
strand_choice = input('Enter 1 for Single Strand, 2 for Multiple Strands: ');

if strand_choice == 2

    % Select the type of bundled conductor
    fprintf('\nSelect the type of conductor:\n');
    fprintf('1. 2-bundle\n2. 3-bundle\n3. 4-bundle\n4. 6/1 ACSR\n');
    bundle_type = input('Choice (1-4): ');

    % Radius of each strand
    r = input('Enter the radius of each strand (in meters): ');

    % Effective radius used for inductance calculation
    r_prime = 0.7788 * r;

    % Distance between strands is needed for bundle calculations
    if bundle_type ~= 4
        d = input('Enter the distance between bundled conductors (d in meters): ');
    end

    % Calculate equivalent GMR for inductance and capacitance
    switch bundle_type

        case 1
            % Formula for a 2-bundle conductor
            GMRL = sqrt(r_prime * d);
            GMRC = sqrt(r * d);
            area_multiplier = 2;

        case 2
            % Formula for a 3-bundle conductor
            GMRL = (r_prime * d^2)^(1/3);
            GMRC = (r * d^2)^(1/3);
            area_multiplier = 3;

        case 3
            % Formula for a 4-bundle conductor
            GMRL = 1.09 * (r_prime * d^3)^(1/4);
            GMRC = 1.09 * (r * d^3)^(1/4);
            area_multiplier = 4;

        case 4
            % Equivalent radius used for 6/1 ACSR
            GMRL = 2.177 * r;
            GMRC = 2.177 * r;
            area_multiplier = 6;
    end

    % Find the total cross-sectional area of the conductor
    A = area_multiplier * (pi * r^2);

else

    % For a single strand conductor, enter its radius
    r = input('\nEnter the radius of each conductor (in meters): ');

    % GMR used for inductance
    GMRL = 0.7788 * r;

    % Radius used for capacitance
    GMRC = r;

    % Area of the conductor
    A = pi * r^2;
end


% Select whether the system is single phase or three phase
fprintf('\nSelect system type:\n');
phase_choice = input('Enter 1 for Single Phase, 2 for Three Phase: ');

if phase_choice == 1

    % For single phase, GMD is equal to the distance between
    % the two conductors
    D = input('Enter the distance (D) between both conductors (in meters): ');
    GMD = D;

else

    % Select single circuit or double circuit
    fprintf('\nSelect Three Phase system type:\n');
    ckt_choice = input('Enter 1 for Single Circuit, 2 for Double Circuit: ');

    if ckt_choice == 1

        % Enter the distances between the three phases
        fprintf('\nEnter the values for Single Circuit (in meters):\n');
        D12 = input('D12: ');
        D23 = input('D23: ');
        D31 = input('D31: ');

        % Calculate GMD for a three phase single circuit
        GMD = (D12 * D23 * D31)^(1/3);

    else

        % Enter distances for the double circuit arrangement
        fprintf('\nEnter the values for Double Circuit (in meters):\n');
        D12 = input('D12: ');
        D23 = input('D23: ');
        D31 = input('D31: ');
        d1 = input('d1 (cross-distance 1): ');
        d2 = input('d2 (cross-distance 2): ');
        d3 = input('d3 (cross-distance 3): ');
        d4 = input('d4 (cross-distance 4): ');

        % Calculate GMD for each phase pair
        GMDA = (D12 * d1 * d2 * d3)^(1/4);
        GMDB = (D23 * d2 * d3 * d4)^(1/4);
        GMDC = (D31 * d1 * d3 * d4)^(1/4);

        % Overall GMD of the double circuit
        GMD = (GMDA * GMDB * GMDC)^(1/3);

        % Calculate equivalent GMR for the double circuit
        GMRL = (GMRL * d1 * d2 * d3)^(1/4);
        GMRC = (GMRC * d1 * d2 * d3)^(1/4);
    end
end


% Enter resistivity and length of the transmission line
fprintf('\n');
rho = input('Enter the resistivity of the conductor (rho in ohm-meters): ');
L_len = input('Enter the line length (l in meters): ');


% Calculate total resistance using R = rho*l/A
R = (rho * L_len) / A;


% Calculate inductance per metre
L_per_m = 2e-7 * log(GMD / GMRL);

% Calculate total inductance
L_total = L_per_m * L_len;


% Permittivity of free space
epsilon_0 = 8.854e-12;

% Calculate capacitance per metre
C_per_m = (2 * pi * epsilon_0) / log(GMD / GMRC);

% Calculate total capacitance
C_total = C_per_m * L_len;


% Display the final results
fprintf('\n======================================\n');
fprintf('     TRANSMISSION LINE PARAMETERS     \n');
fprintf('======================================\n');

fprintf('Total Resistance (R)  : %.6e Ohms\n', R);
fprintf('Total Inductance (L)  : %.6e Henries\n', L_total);
fprintf('Total Capacitance (C) : %.6e Farads\n', C_total);

fprintf('======================================\n');

% ==========================================================
% PLOTTING: Conductor Cross Section & Circuit Tower Layout
% ==========================================================
figure('Name', 'Transmission Line Visualizer', 'NumberTitle', 'off', 'Color', [0.98 0.98 0.96]);

% --- Plot 1: Conductor Cross-Section ---
subplot(1, 2, 1);
hold on; axis equal; grid on;
if strand_choice == 1
    % Single strand
    viscircles([0, 0], r, 'Color', [0.15 0.38 0.92], 'LineWidth', 2);
    plot(0, 0, 'b+', 'MarkerSize', 8, 'LineWidth', 1.5);
    title(sprintf('Conductor Cross-Section: Single Strand\nr = %.2f mm, GMR_L = %.2f mm', r*1000, GMRL*1000));
    xlim([-r*2.2, r*2.2]); ylim([-r*2.2, r*2.2]);
else
    if bundle_type == 4
        % 6/1 ACSR (7-Strand)
        viscircles([0, 0], r, 'Color', [0.28 0.33 0.41], 'LineWidth', 2); % Central Steel
        text(0, 0, 'Steel', 'HorizontalAlignment', 'center', 'FontSize', 8, 'FontWeight', 'bold');
        for i = 0:5
            th = i * (pi / 3);
            viscircles([2*r*cos(th), 2*r*sin(th)], r, 'Color', [0.15 0.38 0.92], 'LineWidth', 1.5);
            plot(2*r*cos(th), 2*r*sin(th), 'k.', 'MarkerSize', 4);
        end
        title(sprintf('Conductor Cross-Section: 6/1 ACSR (7-Strand)\nr = %.2f mm, GMR = %.2f mm', r*1000, GMRL*1000));
        xlim([-3.5*r, 3.5*r]); ylim([-3.5*r, 3.5*r]);
    elseif bundle_type == 1
        % 2-bundle
        viscircles([-d/2, 0], r, 'Color', [0.15 0.38 0.92], 'LineWidth', 2);
        viscircles([d/2, 0], r, 'Color', [0.15 0.38 0.92], 'LineWidth', 2);
        plot([-d/2, d/2], [0, 0], 'k--', 'LineWidth', 1.2);
        title(sprintf('Conductor Cross-Section: 2-Bundle\nd = %.2f m, r = %.2f mm', d, r*1000));
        xlim([-d*0.8, d*0.8]); ylim([-d*0.8, d*0.8]);
    elseif bundle_type == 2
        % 3-bundle
        h = d * sqrt(3) / 2;
        pts = [-d/2, -h/3; d/2, -h/3; 0, 2*h/3];
        viscircles(pts, [r; r; r], 'Color', [0.15 0.38 0.92], 'LineWidth', 2);
        plot([pts(:,1); pts(1,1)], [pts(:,2); pts(1,2)], 'k--', 'LineWidth', 1.2);
        title(sprintf('Conductor Cross-Section: 3-Bundle Triangle\nd = %.2f m, r = %.2f mm', d, r*1000));
        xlim([-d*0.8, d*0.8]); ylim([-d*0.8, d*0.8]);
    elseif bundle_type == 3
        % 4-bundle
        s = d / 2;
        pts = [-s, -s; s, -s; s, s; -s, s];
        viscircles(pts, [r; r; r; r], 'Color', [0.15 0.38 0.92], 'LineWidth', 2);
        plot([pts(:,1); pts(1,1)], [pts(:,2); pts(1,2)], 'k--', 'LineWidth', 1.2);
        title(sprintf('Conductor Cross-Section: 4-Bundle Square\nd = %.2f m, r = %.2f mm', d, r*1000));
        xlim([-d*0.8, d*0.8]); ylim([-d*0.8, d*0.8]);
    end
end
xlabel('X (m)'); ylabel('Y (m)');

% --- Plot 2: Circuit / Tower Geometry Layout ---
subplot(1, 2, 2);
hold on; axis equal; grid on;
if phase_choice == 1
    % Single Phase
    plot(-D/2, 0, 'bo', 'MarkerSize', 12, 'MarkerFaceColor', [0.15 0.38 0.92]);
    plot(D/2, 0, 'ro', 'MarkerSize', 12, 'MarkerFaceColor', [0.92 0.35 0.05]);
    plot([-D/2, D/2], [0, 0], 'k--', 'LineWidth', 1.2);
    text(-D/2, D*0.12, 'Phase A', 'HorizontalAlignment', 'center', 'FontWeight', 'bold');
    text(D/2, D*0.12, 'Phase B', 'HorizontalAlignment', 'center', 'FontWeight', 'bold');
    title(sprintf('Circuit Geometry: Single Phase\nD = %.2f m, GMD = %.2f m', D, GMD));
    xlim([-D*0.85, D*0.85]); ylim([-D*0.5, D*0.5]);
else
    if ckt_choice == 1
        % 3-Phase Single Circuit
        if abs((D12 + D23) - D31) < 1e-3
            % Flat horizontal
            plot(-D12, 0, 'ro', 'MarkerSize', 10, 'MarkerFaceColor', 'r');
            plot(0, 0, 'yo', 'MarkerSize', 10, 'MarkerFaceColor', [0.85 0.65 0.05]);
            plot(D23, 0, 'bo', 'MarkerSize', 10, 'MarkerFaceColor', 'b');
            plot([-D12, D23], [0, 0], 'k--', 'LineWidth', 1.2);
            text(-D12, max(D12,D23)*0.1, 'Phase A', 'HorizontalAlignment', 'center');
            text(0, max(D12,D23)*0.1, 'Phase B', 'HorizontalAlignment', 'center');
            text(D23, max(D12,D23)*0.1, 'Phase C', 'HorizontalAlignment', 'center');
            title(sprintf('Circuit Geometry: 3-Phase Flat Single\nGMD = %.2f m', GMD));
        else
            % Triangular
            x1 = (D12^2 - D31^2 + D23^2) / (2 * D23);
            y1 = sqrt(max(0, D12^2 - x1^2));
            cx = (x1 + D23) / 3; cy = y1 / 3;
            plot(x1 - cx, y1 - cy, 'ro', 'MarkerSize', 10, 'MarkerFaceColor', 'r');
            plot(0 - cx, 0 - cy, 'yo', 'MarkerSize', 10, 'MarkerFaceColor', [0.85 0.65 0.05]);
            plot(D23 - cx, 0 - cy, 'bo', 'MarkerSize', 10, 'MarkerFaceColor', 'b');
            plot([x1-cx, 0-cx, D23-cx, x1-cx], [y1-cy, 0-cy, 0-cy, y1-cy], 'k--', 'LineWidth', 1.2);
            title(sprintf('Circuit Geometry: 3-Phase Triangular\nGMD = %.2f m', GMD));
        end
    else
        % Double Circuit
        plot([0, 0], [-d4*1.4, d4*1.4], 'k-.', 'LineWidth', 1.5); % Centerline
        % Left Circuit
        plot(-d1/2, d4, 'bo', 'MarkerSize', 10, 'MarkerFaceColor', 'b');
        plot(-d2/2, 0, 'bo', 'MarkerSize', 10, 'MarkerFaceColor', 'b');
        plot(-d3/2, -d4, 'bo', 'MarkerSize', 10, 'MarkerFaceColor', 'b');
        % Right Circuit
        plot(d1/2, d4, 'ro', 'MarkerSize', 10, 'MarkerFaceColor', [0.92 0.35 0.05]);
        plot(d2/2, 0, 'ro', 'MarkerSize', 10, 'MarkerFaceColor', [0.92 0.35 0.05]);
        plot(d3/2, -d4, 'ro', 'MarkerSize', 10, 'MarkerFaceColor', [0.92 0.35 0.05]);
        % Crossarms
        plot([-d1/2, d1/2], [d4, d4], 'k-', 'LineWidth', 1.5);
        plot([-d2/2, d2/2], [0, 0], 'k-', 'LineWidth', 1.5);
        plot([-d3/2, d3/2], [-d4, -d4], 'k-', 'LineWidth', 1.5);
        title(sprintf('Circuit Geometry: 3-Phase Double Circuit\nGMD = %.2f m', GMD));
    end
end
xlabel('X (m)'); ylabel('Y (m)');