class ApplicationController < ActionController::Base
  protect_from_forgery

  layout "application_guest"

  after_filter :add_flash_to_header
  before_filter :set_timezone, :dev_javascript

  def after_sign_in_path_for(resource_or_scope)
    if resource_or_scope.is_a?(User)
      app_redirect_url
    else
      super
    end
  end

  private

  def set_timezone
    Time.zone = current_user.time_zone if user_signed_in?
  end

  def add_flash_to_header
    # only run this in case it's an Ajax request.
    return unless request.xhr?

    # add different flashes to header
    response.headers['X-Flash-Error'] = flash[:error]  unless flash[:error].blank?
    response.headers['X-Flash-Warning'] = flash[:warning]  unless flash[:warning].blank?
    response.headers['X-Flash-Notice'] = flash[:notice]  unless flash[:notice].blank?
    response.headers['X-Flash-Message'] = flash[:message]  unless flash[:message].blank?

    # make sure flash does not appear on the next page
    flash.discard
  end

  def dev_javascript
    if params[:dev_javascript] == "1"
      session[:dev_javascript] = true
    end

    if params[:dev_javascript] == "0"
      session[:dev_javascript] = false
    end
  end

  def get_last_updated_model( model_collection )
    data_sorted = model_collection.sort do |x,y|
      x.updated_at.utc <=> y.updated_at.utc
    end
    data_sorted.last
  end
end
