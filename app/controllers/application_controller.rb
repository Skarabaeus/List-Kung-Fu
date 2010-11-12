class ApplicationController < ActionController::Base
  protect_from_forgery

  layout :layout_by_login

  after_filter :add_flash_to_header

  private

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

  def layout_by_login
    if user_signed_in?
      "application_signed_in"
    else
      "application_guest"
    end
  end
end
